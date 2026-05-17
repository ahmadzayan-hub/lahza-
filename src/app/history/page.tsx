"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";
import {
  readLocalHistory,
  statsFromHistory,
  clearLocalHistory,
  type LocalSession
} from "@/lib/local-history";
import { methodById } from "@/lib/prompt-methods";
import { scoreToTone } from "@/lib/quality-score";

interface ApiSession {
  id: string;
  raw_prompt: string;
  intent: string | null;
  status: string;
  target_model: string | null;
  created_at: string;
  updated_at: string;
}

export default function HistoryPage() {
  const t = useT();
  const { locale } = useI18n();
  const [cloud, setCloud] = useState<ApiSession[]>([]);
  const [local, setLocal] = useState<LocalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");

  useEffect(() => {
    setLocal(readLocalHistory());
    let cancelled = false;
    (async () => {
      const r = await safeFetch<{ sessions: ApiSession[] }>("/api/sessions");
      if (!cancelled && r.ok && r.data) setCloud(r.data.sessions ?? []);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => statsFromHistory(local), [local]);

  const intents = useMemo(() => {
    const set = new Set<string>();
    local.forEach((r) => r.intent && set.add(r.intent));
    cloud.forEach((r) => r.intent && set.add(r.intent));
    return Array.from(set).sort();
  }, [local, cloud]);

  const filteredLocal = useMemo(() => {
    const q = query.trim().toLowerCase();
    return local.filter((r) => {
      if (intentFilter !== "all" && r.intent !== intentFilter) return false;
      if (!q) return true;
      return r.raw_prompt.toLowerCase().includes(q) || r.final_prompt.toLowerCase().includes(q);
    });
  }, [local, query, intentFilter]);

  function reset() {
    if (!confirm(locale === "ar" ? "مسح السجل المحلي؟" : "Clear local history?")) return;
    clearLocalHistory();
    setLocal([]);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">{t("history.title")}</h1>
        {local.length > 0 && (
          <button onClick={reset} className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs">
            {locale === "ar" ? "مسح السجل المحلي" : "Clear local history"}
          </button>
        )}
      </div>

      {/* Dashboard */}
      {local.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label={locale === "ar" ? "إجمالي الموجِّهات" : "Total prompts"}
            value={stats.total}
            tone="brand"
          />
          <Stat
            label={locale === "ar" ? "متوسّط الجودة" : "Avg quality"}
            value={`${stats.avgScore}`}
            tone={scoreToTone(stats.avgScore)}
            suffix="/100"
          />
          <Stat
            label={locale === "ar" ? "آخر 7 أيام" : "Last 7 days"}
            value={stats.last7Days}
            tone="violet"
          />
          <Stat
            label={locale === "ar" ? "طريقة مفضّلة" : "Top method"}
            value={
              stats.topMethods[0]
                ? (locale === "ar"
                    ? methodById(stats.topMethods[0].method).name_ar
                    : methodById(stats.topMethods[0].method).name_en)
                : "—"
            }
            tone="emerald"
            small
          />
        </section>
      )}

      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          placeholder={t("history.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)}>
          <option value="all">{t("history.all_intents")}</option>
          {intents.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 self-center">
          {t("history.count", { shown: filteredLocal.length, total: local.length })}
        </span>
      </div>

      {loading && <p className="text-slate-500 text-sm">…</p>}

      <div className="space-y-3">
        {filteredLocal.map((s) => {
          const tone = scoreToTone(s.score);
          const toneCls = {
            rose: "bg-rose-50 text-rose-700",
            amber: "bg-amber-50 text-amber-700",
            emerald: "bg-emerald-50 text-emerald-700"
          }[tone];
          return (
            <div key={s.id} className="card hover:shadow-md dark:bg-slate-900 dark:border-slate-800 transition">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-1">
                <span>{new Date(s.created_at).toLocaleString()}</span>
                <span className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${toneCls}`}>{s.score}/100</span>
                  <span>{s.intent} · {s.target_model} · {locale === "ar" ? methodById(s.method).name_ar : methodById(s.method).name_en}</span>
                </span>
              </div>
              <p className="mt-2 text-sm line-clamp-2 dark:text-slate-200">{s.raw_prompt}</p>
            </div>
          );
        })}
        {!loading && filteredLocal.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {local.length === 0 ? t("history.empty") : t("history.empty_filter")}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  suffix,
  small
}: {
  label: string;
  value: number | string;
  tone: "brand" | "violet" | "emerald" | "rose" | "amber";
  suffix?: string;
  small?: boolean;
}) {
  const tones: Record<string, string> = {
    brand: "from-indigo-500 to-violet-500",
    violet: "from-violet-500 to-fuchsia-500",
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
    amber: "from-amber-500 to-orange-500"
  };
  return (
    <div className="card dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone]}`} />
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`mt-1 font-semibold dark:text-slate-100 ${small ? "text-base" : "text-2xl"} tabular-nums`}>
        {value}
        {suffix && <span className="text-sm text-slate-400 ms-1">{suffix}</span>}
      </div>
    </div>
  );
}
