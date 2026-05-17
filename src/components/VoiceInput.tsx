"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort?(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart?: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface Props {
  onTranscript: (text: string, append: boolean) => void;
  className?: string;
}

/**
 * Voice-to-text mic with persistent listening.
 * Most browsers (notably Chrome) auto-stop the recogniser after a short
 * silence even with `continuous: true`. We work around that by listening
 * to `onend` and immediately restarting the recogniser as long as the
 * user has not manually toggled the mic off. This gives an experience
 * closer to a phone-style "hold to talk until done" but hands-free.
 */
export default function VoiceInput({ onTranscript, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Mirror of the listening state used inside async event handlers,
  // since closures capture the value at the time of binding.
  const wantListeningRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  // Build the recogniser once we know the runtime supports it
  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = locale === "ar" ? "ar-SA" : "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) chunk += e.results[i][0].transcript;
      }
      if (chunk) onTranscript(chunk.trim(), true);
    };

    rec.onerror = (e) => {
      // "no-speech" and "aborted" are common during long sessions and we
      // want to keep going. Surface the rest.
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(e.error);
      wantListeningRef.current = false;
      setListening(false);
    };

    rec.onend = () => {
      // Auto-restart unless the user explicitly toggled off
      if (wantListeningRef.current) {
        try {
          rec.start();
        } catch {
          // already started — ignore
        }
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    return () => {
      wantListeningRef.current = false;
      try { rec.stop(); } catch { /* ignore */ }
      recRef.current = null;
    };
  }, [locale, onTranscript]);

  // Update lang when the user flips locale mid-session
  useEffect(() => {
    if (recRef.current) recRef.current.lang = locale === "ar" ? "ar-SA" : "en-US";
  }, [locale]);

  // Lightweight elapsed-time counter while listening
  useEffect(() => {
    if (listening) {
      setSeconds(0);
      tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [listening]);

  function toggle() {
    setError(null);
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      // Manual stop: prevent the auto-restart in onend
      wantListeningRef.current = false;
      try { rec.stop(); } catch { /* ignore */ }
      setListening(false);
    } else {
      try {
        rec.lang = locale === "ar" ? "ar-SA" : "en-US";
        wantListeningRef.current = true;
        rec.start();
        setListening(true);
      } catch (e) {
        wantListeningRef.current = false;
        setError(String(e));
      }
    }
  }

  if (!supported) {
    return (
      <span className={`text-xs text-slate-500 ${className ?? ""}`} title={t("voice.unsupported")}>
        🎤
      </span>
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? t("voice.stop") : t("voice.start")}
        className={
          "relative inline-flex items-center justify-center w-10 h-10 rounded-full transition shadow-sm " +
          (listening
            ? "bg-rose-600 text-white shadow-rose-300/50"
            : "bg-white border border-slate-300 text-slate-700 hover:border-brand-400 hover:text-brand-700")
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        {listening && (
          <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/40" />
        )}
      </button>
      {listening && (
        <span className="text-xs text-rose-600 font-medium tabular-nums">
          ● {mm}:{ss}
        </span>
      )}
      {error && (
        <span className="text-xs text-rose-700">{t("voice.error", { detail: error })}</span>
      )}
    </div>
  );
}
