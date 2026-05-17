"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import { scorePrompt, type QualityBreakdown } from "@/lib/quality-score";

interface Props {
  finalText: string;
  rawText: string;
  className?: string;
}

const TIER_CLASS: Record<QualityBreakdown["tier"], { ring: string; text: string; bg: string }> = {
  low:  { ring: "stroke-rose-500",    text: "text-rose-700",    bg: "bg-rose-50" },
  mid:  { ring: "stroke-amber-500",   text: "text-amber-700",   bg: "bg-amber-50" },
  high: { ring: "stroke-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" }
};

/** A 0-100 score gauge with a small bar-breakdown of its 5 dimensions. */
export default function QualityBadge({ finalText, rawText, className }: Props) {
  const t = useT();
  const score = scorePrompt(finalText);
  const before = scorePrompt(rawText);
  const tier = TIER_CLASS[score.tier];
  const tierLabel = t(
    score.tier === "high" ? "quality.tier.high" :
    score.tier === "mid"  ? "quality.tier.mid"  : "quality.tier.low"
  );
  const delta = Math.max(0, score.total - before.total);
  const dims: Array<{ key: keyof QualityBreakdown; labelKey: "quality.dim.clarity" | "quality.dim.specificity" | "quality.dim.structure" | "quality.dim.audience" | "quality.dim.format" }> = [
    { key: "clarity",     labelKey: "quality.dim.clarity" },
    { key: "specificity", labelKey: "quality.dim.specificity" },
    { key: "structure",   labelKey: "quality.dim.structure" },
    { key: "audience",    labelKey: "quality.dim.audience" },
    { key: "format",      labelKey: "quality.dim.format" }
  ];

  // Geometry for the SVG ring
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score.total / 100);

  return (
    <div
      className={
        "rounded-xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 " +
        tier.bg + " " + (className ?? "")
      }
      role="group"
      aria-label={t("quality.score_aria", { score: score.total })}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" className="flex-shrink-0">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={"transition-[stroke-dashoffset] duration-500 " + tier.ring}
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="36" textAnchor="middle" className={"text-base font-bold " + tier.text} fill="currentColor">
          {score.total}
        </text>
      </svg>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={"text-xs font-semibold " + tier.text}>{t("quality.label")}</span>
          <span className="text-sm font-medium text-slate-800">{tierLabel}</span>
          {delta > 0 && (
            <span className="text-[11px] text-emerald-700">{t("quality.delta", { delta })}</span>
          )}
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          {dims.map((d) => {
            const v = score[d.key] as number;
            return (
              <li key={d.key as string} className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-600 w-16 sm:w-20 truncate">{t(d.labelKey)}</span>
                <span className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <span
                    className={
                      "block h-full rounded-full transition-[width] duration-500 " +
                      (v >= 14 ? "bg-emerald-500" : v >= 8 ? "bg-amber-500" : "bg-rose-500")
                    }
                    style={{ width: `${(v / 20) * 100}%` }}
                  />
                </span>
                <span className="text-[10px] tabular-nums text-slate-500 w-6 text-end">{v}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
