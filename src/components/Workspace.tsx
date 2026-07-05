"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";
import {
  detectIntentLocal,
  generateQuestionsLocal,
  type LocalQuestion
} from "@/lib/local-engine";
import type { TargetModel } from "@/lib/types";
import VoiceInput from "@/components/VoiceInput";
import FileUpload, { type AttachedFile, formatAttachedAsContext } from "@/components/FileUpload";
import MethodSelector from "@/components/MethodSelector";
import MethodCompare from "@/components/MethodCompare";
import QualityScoreCard from "@/components/QualityScore";
import ExportButton from "@/components/ExportButton";
import { SparkIcon } from "@/components/Icons";
import { buildPromptByMethod, type PromptMethodId } from "@/lib/prompt-methods";
import { scorePrompt } from "@/lib/quality-score";
import { saveLocalSession } from "@/lib/local-history";
import { estimateTokens } from "@/lib/token-estimate";
import { readDraft, writeDraft, clearDraft } from "@/lib/auto-save";
import { pinPrompt, isPinnedByText } from "@/lib/pinned-prompts";

interface PromptVersion {
  id: string;
  version: number;
  target_model: TargetModel;
  final_prompt: string;
  rationale: string | null;
}

interface UIQuestion {
  id: string;
  position: number;
  question: string;
  rationale: string | null;
  required: boolean;
}

interface UISession {
  id: string;
  intent: string;
  intent_confidence: number;
  questions: UIQuestion[];
  source: "cloud" | "local";
}

export default function Workspace() {
  const t = useT();
  const { locale } = useI18n();
  const [raw, setRaw] = useState("");
  const [model, setModel] = useState<TargetModel>("generic");
  const [method, setMethod] = useState<PromptMethodId>("auto");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [session, setSession] = useState<UISession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [rationale, setRationale] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);


  // Hydrate starter from /templates OR last unsubmitted draft from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stash = sessionStorage.getItem("po_starter");
    if (stash) {
      try {
        const { text, model: m } = JSON.parse(stash) as { text: string; model: TargetModel };
        setRaw(text);
        if (m) setModel(m);
      } catch { /* ignore */ }
      sessionStorage.removeItem("po_starter");
      return;
    }
    const d = readDraft();
    if (d) {
      setRaw(d.raw);
      if (d.model) setModel(d.model as TargetModel);
      if (d.method) setMethod(d.method as PromptMethodId);
    }
  }, []);

  // Auto-save the draft as the user types (debounced)
  useEffect(() => {
    if (!raw) {
      clearDraft();
      return;
    }
    const id = setTimeout(() => writeDraft({ raw, model, method }), 500);
    return () => clearTimeout(id);
  }, [raw, model, method]);

  function composedPrompt(): string {
    return raw + formatAttachedAsContext(files, locale);
  }

  async function startSession(quick = false) {
    setLoading(true); setError(null); setInfo(null); setFinalPrompt(null); setRationale(null);
    const composed = composedPrompt();

    const r = await safeFetch<{
      session: {
        id: string;
        intent: string | null;
        intent_confidence: number | null;
        questions: UIQuestion[];
        prompt_versions?: PromptVersion[];
      };
      mode: string;
    }>("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_prompt: composed, target_model: model, quick })
    });

    if (r.ok && r.data) {
      const s = r.data.session;
      setSession({
        id: s.id,
        intent: s.intent ?? "other",
        intent_confidence: s.intent_confidence ?? 0,
        questions: s.questions ?? [],
        source: "cloud"
      });
      setAnswers({});
      if (r.data.mode === "quick" && s.prompt_versions?.length) {
        setFinalPrompt(s.prompt_versions[0].final_prompt);
        setRationale(s.prompt_versions[0].rationale);
      }
      setLoading(false);
      return;
    }
    runLocal(quick, composed);
  }

  function runLocal(quick: boolean, composed: string) {
    const intent = detectIntentLocal(composed);
    if (quick) {
      const built = buildPromptByMethod({
        method, raw: composed, qa: [], targetModel: model, locale
      });
      setSession({
        id: "local",
        intent: intent.intent,
        intent_confidence: intent.confidence,
        questions: [],
        source: "local"
      });
      setFinalPrompt(built.prompt);
      setRationale(built.rationale);
      persistLocal(composed, built.prompt, intent.intent, built.method);
      setInfo(locale === "ar" ? "وضع محلي. لا يحتاج إلى اتصال." : "Running locally. No backend needed.");
      setLoading(false);
      return;
    }
    const questions: LocalQuestion[] = generateQuestionsLocal(composed, intent.intent, locale);
    setSession({
      id: "local",
      intent: intent.intent,
      intent_confidence: intent.confidence,
      questions,
      source: "local"
    });
    setAnswers({});
    setInfo(locale === "ar" ? "وضع محلي. لا يحتاج إلى اتصال." : "Running locally. No backend needed.");
    setLoading(false);
  }

  function persistLocal(rawPrompt: string, finalText: string, intent: string, methodUsed: PromptMethodId) {
    try {
      saveLocalSession({
        raw_prompt: rawPrompt,
        final_prompt: finalText,
        intent,
        method: methodUsed,
        target_model: model,
        score: scorePrompt(finalText).overall
      });
      clearDraft();
    } catch {
      /* quota — fine to ignore */
    }
  }

  async function submitAnswers() {
    if (!session) return;
    setLoading(true); setError(null);
    const composed = composedPrompt();

    if (session.source === "local") {
      const qa = session.questions
        .map((q) => ({ question: q.question, answer: (answers[q.id] ?? "").trim() }))
        .filter((p) => p.answer.length > 0);
      const built = buildPromptByMethod({
        method, raw: composed, qa, targetModel: model, locale
      });
      setFinalPrompt(built.prompt);
      setRationale(built.rationale);
      persistLocal(composed, built.prompt, session.intent, built.method);
      setLoading(false);
      return;
    }

    const payload = Object.entries(answers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([question_id, answer]) => ({ question_id, answer }));
    if (payload.length > 0) {
      await safeFetch(`/api/sessions/${session.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload })
      });
    }
    const r = await safeFetch<{ version: PromptVersion }>(`/api/sessions/${session.id}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_model: model })
    });
    if (!r.ok || !r.data) {
      const qa = session.questions
        .map((q) => ({ question: q.question, answer: (answers[q.id] ?? "").trim() }))
        .filter((p) => p.answer.length > 0);
      const built = buildPromptByMethod({
        method, raw: composed, qa, targetModel: model, locale
      });
      setFinalPrompt(built.prompt);
      setRationale(built.rationale);
      persistLocal(composed, built.prompt, session.intent, built.method);
      setInfo(locale === "ar" ? "أُكمل الموجِّه محليًا بعد تعذّر الخادم." : "Completed locally after server was unreachable.");
    } else {
      setFinalPrompt(r.data.version.final_prompt);
      setRationale(r.data.version.rationale);
      persistLocal(composed, r.data.version.final_prompt, session.intent, method);
    }
    setLoading(false);
  }

  function reset() {
    setSession(null); setAnswers({}); setFinalPrompt(null); setRationale(null); setError(null); setInfo(null);
  }

  async function copyFinal() {
    if (!finalPrompt) return;
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function appendVoice(text: string) {
    setRaw((cur) => (cur ? cur.trim() + " " + text : text));
  }

  const beforeStats = useMemo(() => stats(raw), [raw]);
  const afterStats = useMemo(() => (finalPrompt ? stats(finalPrompt) : null), [finalPrompt]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* MAIN EDITOR — full width on mobile/tablet, 2/3 on desktop */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <section className="card relative overflow-hidden">
            <svg
              aria-hidden="true"
              className="absolute -top-6 -right-6 w-28 h-28 opacity-15 pointer-events-none rtl:right-auto rtl:-left-6"
              viewBox="0 0 100 100" fill="none"
            >
              <defs>
                <linearGradient id="sp" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <path d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z" fill="url(#sp)"/>
            </svg>

            <div className="flex items-baseline justify-between flex-wrap gap-1">
              <label className="text-sm font-semibold">{t("ws.label.raw")}</label>
              <span className="text-xs text-slate-500 tabular-nums">
                {t("ws.stats", { chars: beforeStats.chars, words: beforeStats.words })}
                {raw && (
                  <span className="ms-2 text-slate-400">
                    {locale === "ar" ? "~" : "≈"}{estimateTokens(raw)} {locale === "ar" ? "وحدة" : "tok"}
                  </span>
                )}
              </span>
            </div>

            <div className="mt-3 relative">
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && raw.length >= 3 && !loading) {
                    e.preventDefault();
                    startSession(false);
                  }
                }}
                rows={8}
                className="w-full pe-14 min-h-[180px] sm:min-h-[220px] resize-y leading-relaxed"
                placeholder={t("ws.placeholder.raw")}
              />
              <div className="absolute bottom-3 end-3">
                <VoiceInput onTranscript={appendVoice} />
              </div>
            </div>

            <FileUpload files={files} onChange={setFiles} className="mt-5" />

            <MethodSelector value={method} onChange={setMethod} className="mt-5" />

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 sm:gap-3 flex-wrap">
              <label className="text-sm font-medium text-slate-700">{t("ws.target")}</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as TargetModel)}
                className="min-w-[120px]"
              >
                <option value="generic">{t("ws.model.generic")}</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="claude">Claude</option>
                <option value="copilot">Copilot</option>
                <option value="gemini">Gemini</option>
              </select>
              <div className="flex-1 min-w-[8px]" />
              {session && (
                <button onClick={reset} className="btn-ghost text-xs sm:text-sm">
                  {t("ws.btn.new_session")}
                </button>
              )}
              <button
                onClick={() => startSession(true)}
                disabled={loading || raw.length < 3}
                className="btn-ghost border border-slate-300 text-xs sm:text-sm"
              >
                {t("ws.btn.quick")}
              </button>
              <button
                onClick={() => startSession(false)}
                disabled={loading || raw.length < 3}
                className="btn-primary text-xs sm:text-sm"
              >
                {loading ? t("ws.btn.working") : session ? t("ws.btn.restart") : t("ws.btn.start")}
              </button>
            </div>

            {info && (
              <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 text-sky-800 p-3 text-sm flex items-start gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <span>{info}</span>
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">
                <div className="font-medium">{error.message}</div>
                {error.hint && <div className="text-rose-700 text-xs mt-1">{error.hint}</div>}
              </div>
            )}
          </section>

          {session && session.questions.length > 0 && !finalPrompt && (
            <section className="card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t("ws.detected_intent")}</div>
                  <div className="font-medium flex items-center gap-2 mt-1">
                    <IntentBadge intent={session.intent} />
                    <span className="text-xs text-slate-500">
                      {t("ws.confidence", { percent: Math.round(session.intent_confidence * 100) })}
                    </span>
                  </div>
                </div>
                {session.source === "local" && (
                  <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    local
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                <div className="text-sm font-semibold">{t("ws.questions_title")}</div>
                {session.questions
                  .sort((a, b) => a.position - b.position)
                  .map((q) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium">{q.question}</label>
                      {q.rationale && <div className="text-xs text-slate-500 mt-0.5">{q.rationale}</div>}
                      <textarea
                        rows={2}
                        className="w-full mt-2"
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                <button onClick={submitAnswers} disabled={loading} className="btn-primary">
                  {loading ? t("ws.btn.generating") : t("ws.btn.generate")}
                </button>
              </div>
            </section>
          )}

          {finalPrompt && (
            <>
              <QualityScoreCard score={scorePrompt(finalPrompt)} />
              <MethodCompare raw={composedPrompt()} targetModel={model} />

              <section className="card">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-semibold flex items-center gap-2">
                    <SparkIcon /> {t("ws.final_title")}
                  </div>
                  <div className="flex items-center gap-2">
                    <PinButton finalText={finalPrompt} model={model} method={method} />
                    <ExportButton content={finalPrompt} />
                    <button onClick={copyFinal} className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs sm:text-sm">
                      {copied ? t("ws.copied") : t("ws.btn.copy")}
                    </button>
                  </div>
                </div>
                <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 dark:bg-slate-900 p-4 text-sm border border-slate-200 dark:border-slate-800 leading-relaxed">
{finalPrompt}
                </pre>
                {rationale && (
                  <details className="mt-3 text-sm text-slate-600">
                    <summary className="cursor-pointer">{t("ws.why")}</summary>
                    <p className="mt-2">{rationale}</p>
                  </details>
                )}
              </section>

              <section className="grid sm:grid-cols-2 gap-4">
                <div className="card">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{t("ws.before")}</div>
                  <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200">
{raw}
                  </pre>
                  <div className="text-xs text-slate-500 mt-2">
                    {t("ws.stats", { chars: beforeStats.chars, words: beforeStats.words })}
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{t("ws.after")}</div>
                  <pre className="whitespace-pre-wrap rounded bg-emerald-50 p-3 text-sm border border-emerald-200">
{finalPrompt}
                  </pre>
                  <div className="text-xs text-slate-500 mt-2">
                    {afterStats && t("ws.stats", { chars: afterStats.chars, words: afterStats.words })}
                    {afterStats && (
                      <span className="ms-2 text-emerald-700">
                        {t("ws.added_words", { n: Math.max(0, afterStats.words - beforeStats.words) })}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* SIDE PANEL — hidden on mobile, sticky on desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="card sticky top-20 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {locale === "ar" ? "كيف تعمل" : "How it works"}
              </div>
              <ol className="mt-3 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
                  <span>{locale === "ar" ? "اكتب أو أمْلِ صوتيًا أو أرفق ملفًا." : "Type, dictate, or attach a file."}</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-md bg-violet-50 text-violet-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
                  <span>{locale === "ar" ? "أجب عن أسئلة قليلة لتوضيح الطلب." : "Answer a few clarification questions."}</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
                  <span>{locale === "ar" ? "انسخ الموجِّه النهائي وألصقه في النموذج." : "Copy the polished prompt into your AI model."}</span>
                </li>
              </ol>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {locale === "ar" ? "نصائح سريعة" : "Quick tips"}
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex gap-2"><span>🎤</span><span>{locale === "ar" ? "اضغط الميكروفون مرّة، تحدّث بحرية، ثم اضغط ثانية للإيقاف." : "Tap the mic once, speak freely, tap again to stop."}</span></li>
                <li className="flex gap-2"><span>📎</span><span>{locale === "ar" ? "أرفق صورًا أو CSV أو PDF. يُدمج الوصف داخل الموجِّه." : "Attach images, CSV, or PDFs. Described inside the prompt."}</span></li>
                <li className="flex gap-2"><span>⚡</span><span>{locale === "ar" ? "«تحسين سريع» يتخطّى الأسئلة ويولّد الموجِّه فورًا." : "“Quick enhance” skips clarifications and generates instantly."}</span></li>
              </ul>
            </div>

            {files.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {locale === "ar" ? "الملفات المرفقة" : "Attached files"}{" "}
                  <span className="text-slate-400">({files.length})</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  {files.slice(0, 6).map((f) => (
                    <div key={f.id} className="truncate">• {f.name}</div>
                  ))}
                  {files.length > 6 && (
                    <div className="text-slate-400">+{files.length - 6}</div>
                  )}
                </div>
              </div>
            )}

            {session && (
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {locale === "ar" ? "الحالة" : "Status"}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <IntentBadge intent={session.intent} />
                  <span className="text-xs text-slate-500">
                    {Math.round(session.intent_confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function stats(s: string) {
  const trimmed = s.trim();
  return { chars: trimmed.length, words: trimmed ? trimmed.split(/\s+/).length : 0 };
}

function IntentBadge({ intent }: { intent: string }) {
  const tone: Record<string, string> = {
    coding: "bg-violet-50 text-violet-700",
    writing: "bg-sky-50 text-sky-700",
    research: "bg-amber-50 text-amber-700",
    analysis: "bg-emerald-50 text-emerald-700",
    planning: "bg-rose-50 text-rose-700",
    creative: "bg-pink-50 text-pink-700",
    design: "bg-fuchsia-50 text-fuchsia-700",
    conversation: "bg-cyan-50 text-cyan-700",
    other: "bg-slate-100 text-slate-600"
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${tone[intent] ?? tone.other}`}>{intent}</span>
  );
}


function PinButton({
  finalText,
  model,
  method
}: { finalText: string; model: TargetModel; method: PromptMethodId }) {
  const { locale } = useI18n();
  const [pinned, setPinned] = useState(false);
  useEffect(() => { setPinned(isPinnedByText(finalText)); }, [finalText]);

  function toggle() {
    if (pinned) return;
    const title = finalText.split("\n")[0].slice(0, 60) || (locale === "ar" ? "موجِّه محفوظ" : "Saved prompt");
    pinPrompt({ title, text: finalText, method, target_model: model, tags: [] });
    setPinned(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pinned}
      title={locale === "ar" ? "ثبّت في المكتبة" : "Pin to library"}
      className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs sm:text-sm"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"}
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 17l0 5M5 9l7 8l7-8M5 9c0-1 1-3 3-3h8c2 0 3 2 3 3l-7 8z"/>
      </svg>
      {pinned ? (locale === "ar" ? "مثبّت" : "Pinned") : (locale === "ar" ? "ثبّت" : "Pin")}
    </button>
  );
}
