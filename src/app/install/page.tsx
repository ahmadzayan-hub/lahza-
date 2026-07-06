"use client";

import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import InstallButton from "@/components/InstallButton";
import Logo from "@/components/Logo";

export default function InstallPage() {
  const t = useT();
  const { locale } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center gap-3">
        <Logo className="w-12 h-12 rounded-xl shadow" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-slate-50">
            {t("install.title")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t("install.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <InstallButton />
      </div>

      <div className="mt-8 grid gap-4">
        <PlatformCard
          badge={locale === "ar" ? "أندرويد" : "Android"}
          title={t("install.android.title")}
          steps={[t("install.android.step1"), t("install.android.step2"), t("install.android.step3")]}
        />
        <PlatformCard
          badge="iOS"
          title={t("install.ios.title")}
          steps={[t("install.ios.step1"), t("install.ios.step2")]}
        />
        <PlatformCard
          badge={locale === "ar" ? "حاسوب" : "Desktop"}
          title={t("install.desktop.title")}
          steps={[t("install.desktop.step1")]}
        />
      </div>
    </div>
  );
}

function PlatformCard({
  badge, title, steps
}: { badge: string; title: string; steps: string[] }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wide uppercase rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-100 px-2 py-0.5">
          {badge}
        </span>
        <h2 className="font-semibold dark:text-slate-100">{title}</h2>
      </div>
      <ol className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-100 text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
