"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { scoreToTone, type QualityScore } from "@/lib/quality-score";

const toneClasses: Record<"rose" | "amber" | "emerald", { ring: string; text: string; bar: string; bg: string }> = {
  rose:    { ring: "ring-rose-200",    text: "text-rose-700",    bar: "bg-rose-500",    bg: "bg-rose-50" },
  amber:   { ring: "ring-amber-200",   text: "text-amber-700",   bar: "bg-amber-500",   bg: "bg-amber-50" },
  emerald: { ring: "ring-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500", bg: "bg-emerald-50" }
};

export default function QualityScoreCard({ score }: { score: QualityScore }) {
  const { locale } = useI18n();
  const tone = scoreToTone(score.overall);
  const c = toneClasses[tone];

  return (
    <section className={`card ${c.bg} dark:bg-slate-900 dark:border-slate-800`}>
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full bg-white dark:bg-slate-800 ring-4 ${c.ring} flex items-center justify-center font-bold text-2xl ${c.text} tabular-nums`}
        >
          {score.overall}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold dark:text-slate-100">
            {locale === "ar" ? "تقييم جودة الموجِّه" : "Prompt quality score"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "ar" ? "من 100" : "out of 100"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {score.dimensions.map((d) => (
          <div key={d.key}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                {locale === "ar" ? d.label_ar : d.label_en}
              </span>
              <span className="text-slate-400 tabular-nums">{d.score}</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${toneClasses[scoreToTone(d.score)].bar} transition-all`}
                style={{ width: `${d.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {score.weaknesses.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-700 dark:text-slate-300">
            {locale === "ar"
              ? `توصيات للتحسين (${score.recommendations.length})`
              : `Recommendations (${score.recommendations.length})`}
          </summary>
          <ul className="mt-2 ms-4 list-disc text-slate-600 dark:text-slate-400 space-y-1">
            {score.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </details>
      )}

      {score.strengths.length > 0 && (
        <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
          ✓ {locale === "ar" ? "نقاط القوّة:" : "Strong on:"}{" "}
          <span className="font-medium">{score.strengths.join(" · ")}</span>
        </div>
      )}
    </section>
  );
}
