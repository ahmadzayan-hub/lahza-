"use client";

/**
 * VoiceInput — MediaRecorder-based state machine
 *
 * State machine:
 *   idle ──[press record]──► recording
 *   recording ──[press stop]──► stopping
 *   stopping ──[onstop fires + blob ready]──► processing
 *   processing ──[Whisper responds]──► completed | error
 *   error ──[press record again]──► idle → recording
 *
 * Key invariants:
 *   - Audio chunks are ONLY processed inside the onstop handler — never in
 *     ondataavailable. This guarantees the full audio is available before
 *     transcription starts.
 *   - isProcessingRef prevents duplicate submissions if stop fires twice.
 *   - onTranscript is called exactly once, with isFinal=true, after Whisper
 *     returns the complete text. No interim streaming.
 *   - Silence detection is disabled by default. Stop is always manual.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

// ── Types ──────────────────────────────────────────────────────────────────

type RecordingState =
  | "idle"
  | "requesting"   // getUserMedia in flight
  | "recording"    // MediaRecorder is active, chunks accumulating
  | "stopping"     // stop() called, waiting for onstop to fire
  | "processing"   // blob assembled, Whisper call in flight
  | "completed"    // transcript delivered to parent
  | "error";       // any failure — user may retry

interface Props {
  /** Called once with the complete Whisper transcript when processing finishes. */
  onTranscript: (text: string, isFinal: boolean) => void;
  /**
   * Called when a recording session ends (state reaches completed/error/idle).
   * Parent uses this to re-enable the Quick-enhance / Start buttons.
   */
  onRecordingStateChange?: (active: boolean) => void;
  /** Optional: focus the textarea instead of voicing. */
  onTypeInstead?: () => void;
  className?: string;
}

// ── State labels (shown in the UI) ────────────────────────────────────────

const STATE_LABELS: Record<RecordingState, string> = {
  idle:       "",
  requesting: "Requesting microphone…",
  recording:  "Recording",
  stopping:   "Stopping…",
  processing: "Processing…",
  completed:  "Done",
  error:      "Error",
};

const STATE_LABELS_AR: Record<RecordingState, string> = {
  idle:       "",
  requesting: "جارٍ طلب الميكروفون…",
  recording:  "تسجيل",
  stopping:   "جارٍ الإيقاف…",
  processing: "جارٍ المعالجة…",
  completed:  "اكتمل",
  error:      "خطأ",
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Best MIME type MediaRecorder supports on this browser/device. */
function getBestMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "",                        // browser default
  ];
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of candidates) {
    if (!t || MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

/** Format seconds → MM:SS */
function formatTime(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function VoiceInput({
  onTranscript,
  onRecordingStateChange,
  onTypeInstead,
  className,
}: Props) {
  const t = useT();
  const { locale } = useI18n();
  const ar = locale === "ar";

  const [state, setState] = useState<RecordingState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);          // 0..1 RMS for the level meter
  const [transcript, setTranscript] = useState("");

  // MediaRecorder refs — never stored in React state to avoid stale closures
  const recorderRef      = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);
  const isProcessingRef  = useRef(false);          // prevents duplicate Whisper calls
  const stateRef         = useRef<RecordingState>("idle");

  // Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  // Web Audio level meter
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const rafRef       = useRef<number | null>(null);

  // Keep parent in sync whenever the "blocking" state changes
  const notifyParent = useCallback((s: RecordingState) => {
    const active = s === "recording" || s === "stopping" || s === "processing";
    onRecordingStateChange?.(active);
  }, [onRecordingStateChange]);

  function setStateAndNotify(s: RecordingState) {
    stateRef.current = s;
    setState(s);
    notifyParent(s);
  }

  // ── Cleanup ──────────────────────────────────────────────────────

  function teardownAudio() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      teardownAudio();
      stopTimer();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try { recorderRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  // ── Level meter ──────────────────────────────────────────────────

  function startLevelMeter(stream: MediaStream) {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setLevel(Math.min(1, rms * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Level meter is purely decorative — ignore failures
    }
  }

  // ── Core: start recording ────────────────────────────────────────

  async function startRecording() {
    if (stateRef.current !== "idle" && stateRef.current !== "error") return;

    setErrorMsg("");
    setTranscript("");
    setElapsed(0);
    setLevel(0);
    chunksRef.current = [];
    isProcessingRef.current = false;

    // 1. Request microphone
    setStateAndNotify("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,   // Whisper works well at 16 kHz
        },
      });
    } catch (e) {
      const err = e as DOMException;
      const isPermission = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      const isNoDevice   = err?.name === "NotFoundError"   || err?.name === "DevicesNotFoundError";
      setErrorMsg(
        isPermission ? t("voice.denied") :
        isNoDevice   ? t("voice.no_device") :
                       (err?.message ?? String(e))
      );
      setStateAndNotify("error");
      return;
    }
    streamRef.current = stream;
    startLevelMeter(stream);

    // 2. Create MediaRecorder
    const mimeType = getBestMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (e) {
      teardownAudio();
      setErrorMsg(String(e));
      setStateAndNotify("error");
      return;
    }
    recorderRef.current = recorder;

    // 3. Collect chunks — DO NOT process here, only store
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    // 4. onstop: ALL audio is now in chunksRef — process it
    recorder.onstop = async () => {
      // Guard: only one processing run per recording session
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      stopTimer();
      teardownAudio();
      setLevel(0);

      const chunks = chunksRef.current;
      chunksRef.current = [];

      if (chunks.length === 0) {
        setErrorMsg("No audio was captured.");
        setStateAndNotify("error");
        return;
      }

      setStateAndNotify("processing");

      const mimeUsed = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunks, { type: mimeUsed });

      await transcribeBlob(blob, mimeUsed);
    };

    // 5. Start — use a timeslice so ondataavailable fires regularly.
    //    This prevents a single massive blob on mobile Chrome and keeps
    //    memory use bounded for long recordings.
    recorder.start(1000 /* ms timeslice */);

    setStateAndNotify("recording");
    startedAtRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 500);
  }

  // ── Core: stop recording ─────────────────────────────────────────

  function stopRecording() {
    // Only valid to call while actively recording
    if (stateRef.current !== "recording") return;
    setStateAndNotify("stopping");

    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      // Recorder already stopped — nothing to do, onstop will fire or already did
      return;
    }
    try {
      recorder.stop();   // triggers onstop asynchronously
    } catch {
      // If stop() throws, tear down manually
      setErrorMsg("Failed to stop recorder.");
      setStateAndNotify("error");
      teardownAudio();
      stopTimer();
    }
  }

  // ── Core: transcribe ─────────────────────────────────────────────

  async function transcribeBlob(blob: Blob, mimeType: string) {
    const form = new FormData();
    form.append("audio", blob, `rec.${mimeType.split("/")[1]?.split(";")[0] ?? "webm"}`);
    // Pass the UI locale as a hint — Whisper uses it to bias language detection
    const lang = locale === "ar" ? "ar" : "en";
    form.append("language", lang);

    let res: Response;
    try {
      res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
    } catch (e) {
      setErrorMsg(`Network error: ${String(e)}`);
      setStateAndNotify("error");
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      setErrorMsg(body.error ?? `Server error ${res.status}`);
      setStateAndNotify("error");
      return;
    }

    const data = await res.json() as { transcript?: string; error?: string };

    if (data.error) {
      setErrorMsg(data.error);
      setStateAndNotify("error");
      return;
    }

    const text = (data.transcript ?? "").trim();
    if (!text) {
      setErrorMsg(ar ? "لم يُكتشف أي كلام في التسجيل." : "No speech detected in the recording.");
      setStateAndNotify("error");
      return;
    }

    setTranscript(text);
    setStateAndNotify("completed");

    // Deliver complete transcript to parent — single call, isFinal=true
    onTranscript(text, true);

    // Auto-reset to idle after 3 s so the user can record again
    setTimeout(() => {
      if (stateRef.current === "completed") {
        setStateAndNotify("idle");
        setTranscript("");
      }
    }, 3000);
  }

  // ── Derived ──────────────────────────────────────────────────────

  const isRecording  = state === "recording";
  const isStopping   = state === "stopping";
  const isProcessing = state === "processing";
  const isCompleted  = state === "completed";
  const isError      = state === "error";
  const isBusy       = isRecording || isStopping || isProcessing;
  const label        = ar ? STATE_LABELS_AR[state] : STATE_LABELS[state];

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className={`relative flex items-center gap-2 ${className ?? ""}`}>

      {/* ── Transcript / status popover ── */}
      {(isRecording || isStopping || isProcessing || isCompleted || isError) && (
        <div
          className={[
            "absolute bottom-full end-0 mb-2 z-30",
            "min-w-[220px] max-w-[min(480px,calc(100vw-2rem))]",
            "rounded-xl border shadow-lg px-3.5 py-2.5",
            isError
              ? "border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/60"
              : isCompleted
              ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
          ].join(" ")}
          aria-live="polite"
        >
          {/* State label row */}
          <div className="flex items-center gap-2 mb-1">
            <StateDot state={state} />
            <span className={[
              "text-xs font-semibold",
              isError     ? "text-rose-700 dark:text-rose-300"     :
              isCompleted ? "text-emerald-700 dark:text-emerald-300" :
                            "text-slate-700 dark:text-slate-200",
            ].join(" ")}>
              {label}
              {isRecording && (
                <span className="ms-2 font-mono tabular-nums">{formatTime(elapsed)}</span>
              )}
            </span>
          </div>

          {/* Recording: live level meter */}
          {isRecording && (
            <div className="flex items-end gap-[3px] h-4" aria-hidden="true">
              {[0.1, 0.25, 0.45, 0.65, 0.85].map((threshold, i) => (
                <span
                  key={i}
                  className={[
                    "w-[4px] rounded-sm transition-all duration-75",
                    level >= threshold ? "bg-rose-500" : "bg-rose-200 dark:bg-rose-800",
                  ].join(" ")}
                  style={{ height: `${28 + i * 16}%` }}
                />
              ))}
              <span className="ms-2 text-[11px] text-slate-500 dark:text-slate-400">
                {ar ? "جارٍ التسجيل، اضغط إيقاف عند الانتهاء" : "Recording — press Stop when done"}
              </span>
            </div>
          )}

          {/* Processing: spinner */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <svg className="animate-spin w-3.5 h-3.5 text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {ar ? "جارٍ تحويل الصوت إلى نص…" : "Transcribing audio…"}
            </div>
          )}

          {/* Completed: show transcript preview */}
          {isCompleted && transcript && (
            <p className="text-xs text-emerald-800 dark:text-emerald-200 line-clamp-3 leading-relaxed">
              {transcript}
            </p>
          )}

          {/* Error: message + retry */}
          {isError && (
            <div className="space-y-1.5">
              <p className="text-xs text-rose-700 dark:text-rose-300">{errorMsg}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setStateAndNotify("idle"); setErrorMsg(""); }}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition"
                >
                  {ar ? "إعادة المحاولة" : "Retry"}
                </button>
                {onTypeInstead && (
                  <button
                    type="button"
                    onClick={() => { setStateAndNotify("idle"); onTypeInstead(); }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {ar ? "اكتب بدلاً من ذلك" : "Type instead"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Microphone / Stop button ── */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isStopping || isProcessing}
        aria-label={
          isRecording
            ? (ar ? "إيقاف التسجيل" : "Stop recording")
            : (ar ? "بدء التسجيل الصوتي" : "Start voice recording")
        }
        aria-pressed={isRecording}
        title={
          isRecording
            ? (ar ? "اضغط لإيقاف التسجيل وتحويله إلى نص" : "Press to stop and transcribe")
            : (ar ? "ابدأ التسجيل الصوتي" : "Start voice recording")
        }
        className={[
          "relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm",
          isRecording
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : isStopping || isProcessing
            ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            : isCompleted
            ? "bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 text-emerald-700"
            : isError
            ? "bg-rose-50 dark:bg-rose-900/20 border border-rose-300 text-rose-600 hover:bg-rose-100"
            : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500",
        ].join(" ")}
      >
        {/* Icon */}
        {isRecording ? (
          /* Stop square */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : isStopping || isProcessing ? (
          /* Spinner */
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : isCompleted ? (
          /* Checkmark */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          /* Microphone */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        )}

        {/* Pulse ring while recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/40" aria-hidden="true" />
            <span
              className="absolute inset-0 rounded-full bg-rose-300/25"
              style={{
                transform: `scale(${1 + level * 0.5})`,
                transition: "transform 80ms linear",
              }}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {/* ── Inline status label (beside button, not in popover) ── */}
      {state === "requesting" && (
        <span className="text-xs text-slate-500" aria-live="polite">
          {ar ? STATE_LABELS_AR.requesting : STATE_LABELS.requesting}
        </span>
      )}
    </div>
  );
}

// ── Sub-component: animated state dot ─────────────────────────────────────

function StateDot({ state }: { state: RecordingState }) {
  const colorClass =
    state === "recording"  ? "bg-rose-500 animate-pulse" :
    state === "stopping"   ? "bg-amber-400 animate-pulse" :
    state === "processing" ? "bg-brand-500 animate-pulse" :
    state === "completed"  ? "bg-emerald-500" :
    state === "error"      ? "bg-rose-600" :
                             "bg-slate-400";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`}
      aria-hidden="true"
    />
  );
}
