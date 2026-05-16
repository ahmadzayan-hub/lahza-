"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import HeroIllustration from "@/components/HeroIllustration";
import { PenIcon, ChatIcon, SparkleIcon } from "@/components/StepIcons";
import Logo from "@/components/Logo";

export default function HomePage() {
  const t = useT();
  return (
    <div className="relative overflow-hidden">
      {/* soft gradient bg blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-40 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-200/30 to-rose-200/10 blur-3xl rtl:right-auto rtl:-left-20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
        <div className="flex justify-center mb-5">
          <Logo className="w-14 h-14 rounded-2xl shadow-xl shadow-indigo-500/20 po-float" />
        </div>
        <span className="inline-block text-xs font-semibold tracking-wide rounded-full bg-white/70 backdrop-blur border border-slate-200 px-3 py-1 text-transparent po-spectrum bg-clip-text">
          {t("home.pill")}
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">{t("home.subtitle")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="/workspace" className="btn-primary po-shimmer">{t("home.cta.workspace")}</a>
          <a href="/templates" className="btn-ghost border border-slate-300">{t("home.cta.templates")}</a>
        </div>
      </div>

      {/* Hero illustration */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <HeroIllustration className="w-full h-auto" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard
            tone="brand"
            icon={<PenIcon className="w-6 h-6" />}
            title={t("home.step1.title")}
            body={t("home.step1.body")}
          />
          <StepCard
            tone="violet"
            icon={<ChatIcon className="w-6 h-6" />}
            title={t("home.step2.title")}
            body={t("home.step2.body")}
          />
          <StepCard
            tone="emerald"
            icon={<SparkleIcon className="w-6 h-6" />}
            title={t("home.step3.title")}
            body={t("home.step3.body")}
          />
        </div>
      </div>
    </div>
  );
}

function StepCard({
  tone,
  icon,
  title,
  body
}: {
  tone: "brand" | "violet" | "emerald";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700"
  };
  return (
    <div className="card hover:shadow-md hover:-translate-y-0.5 transition group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]} group-hover:scale-110 group-hover:rotate-3 transition`}>
        {icon}
      </div>
      <div className="mt-3 font-medium">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{body}</p>
    </div>
  );
}
