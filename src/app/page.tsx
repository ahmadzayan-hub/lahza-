"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import Logo from "@/components/Logo";
import { PenIcon, ChatIcon, SparkleIcon } from "@/components/Icons";

export default function HomePage() {
  const t = useT();
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[820px] h-[820px] rounded-full bg-gradient-to-br from-brand-500/15 via-brand-700/10 to-accent-500/10 blur-3xl" />
      </div>

      {/* Hero, mobile first */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 sm:pb-14 text-center">
        <div className="flex justify-center mb-5">
          <Logo className="w-14 h-14 rounded-2xl shadow-lg shadow-brand-700/25 dr-float" />
        </div>
        <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-wide rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-100 px-3 py-1">
          {t("home.pill")}
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-50">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t("home.subtitle")}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <a href="/workspace" className="btn-primary">{t("home.cta.workspace")}</a>
          <a href="/templates" className="btn-ghost border border-slate-300 dark:border-slate-700">
            {t("home.cta.templates")}
          </a>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard
            tone="brand"
            icon={<PenIcon className="w-6 h-6" />}
            title={t("home.step1.title")}
            body={t("home.step1.body")}
          />
          <StepCard
            tone="accent"
            icon={<ChatIcon className="w-6 h-6" />}
            title={t("home.step2.title")}
            body={t("home.step2.body")}
          />
          <StepCard
            tone="brand"
            icon={<SparkleIcon className="w-6 h-6" />}
            title={t("home.step3.title")}
            body={t("home.step3.body")}
          />
        </div>
      </section>
    </div>
  );
}

function StepCard({
  tone, icon, title, body
}: {
  tone: "brand" | "accent";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-100",
    accent: "bg-amber-50 dark:bg-amber-900/40 text-accent-600 dark:text-accent-400"
  };
  return (
    <div className="card group hover:shadow-md hover:-translate-y-0.5 transition">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]} group-hover:scale-110 transition`}>
        {icon}
      </div>
      <div className="mt-3 font-medium dark:text-slate-100">{title}</div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{body}</p>
    </div>
  );
}
