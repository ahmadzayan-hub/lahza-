"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { buildPromptByMethod, type PromptMethodId, methodById } from "@/lib/prompt-methods";
import { scorePrompt, scoreToTone } from "@/lib/quality-score";
import type { TargetModel } from "@/lib/types";

interface Props {
  raw: string;
  targetModel: TargetModel;
  className?: string;
}

const METHODS_TO_COMPARE: PromptMethodId[] = ["craft", "structured", "few_shot", "chain", "task"];

export default function MethodCompare({ raw, targetModel, className }: Props) {
  const { locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<PromptMethodId>("craft");
  const [copied, setCopied] = useState(false);

  if (raw.trim().length < 10) return null;

  const versions = METHODS_TO_COMPARE.map((m) => {
    const built = buildPromptByMethod({
      method: m, raw, qa: [], targetModel, locale
    });
    const score = scorePrompt(built.prompt).overall;
    return { method: m, prompt: built.prompt, score };
  });

  const current = versions.find((v) => v.method === active) ?? versions[0];

  async function copyCurrent() {
    await navigator.clipboard.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className={`card ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-start"
      >
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {locale === "ar" ? "قارن الأساليب" : "Compare methods"}
          </div>
          <div className="font-semibold dark:text-slate-100">
            {locale === "ar"
              ? "شاهد نفس الفكرة بخمسة أساليب صياغة مختلفة"
              : "See the same idea built five different ways"}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {versions.map((v) => {
              const tone = scoreToTone(v.score);
              const isActive = v.method === active;
              return (
                <button
                  key={v.method}
                  type="button"
                  onClick={() => setActive(v.method)}
                  className={
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border transition " +
                    (isActive
                      ? "bg-brand-50 text-brand-700 border-brand-200 dark:bg-slate-800 dark:text-brand-300 dark:border-slate-700"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700")
                  }
                >
                  <span>{locale === "ar" ? methodById(v.method).name_ar : methodById(v.method).name_en}</span>
                  <span className={
                    "px-1.5 py-0 rounded text-[10px] tabular-nums " +
                    { rose: "bg-rose-100 text-rose-700",
                      amber: "bg-amber-100 text-amber-700",
                      emerald: "bg-emerald-100 text-emerald-700" }[tone]
                  }>{v.score}</span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 dark:bg-slate-900 p-4 text-xs border border-slate-200 dark:border-slate-800 leading-relaxed max-h-[280px] overflow-auto">
{current.prompt}
            </pre>
            <button
              type="button"
              onClick={copyCurrent}
              className="absolute top-2 end-2 btn-ghost border border-slate-300 dark:border-slate-700 text-xs px-2 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur"
            >
              {copied ? (locale === "ar" ? "نُسخ!" : "Copied!") : (locale === "ar" ? "نسخ" : "Copy")}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "ar"
              ? "الرقم بجوار كل أسلوب هو تقييم الجودة. اختر الأعلى أو الأنسب لطلبك."
              : "The number next to each method is its quality score. Pick the highest, or the one that best fits your task."}
          </p>
        </div>
      )}
    </section>
  );
}
