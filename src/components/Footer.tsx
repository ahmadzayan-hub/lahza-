"use client";

import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

export default function Footer() {
  const t = useT();
  const { locale } = useI18n();
  const ar = locale === "ar";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      {/* Android download strip */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-50 via-violet-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📱</span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {ar ? "التطبيق على أندرويد" : "ZAIan Studio for Android"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ar ? "أندرويد 5.1 فأعلى · مجاني · بدون إعلانات" : "Android 5.1+ · Free · No ads"}
              </p>
            </div>
          </div>
          <a
            href="/download"
            className="btn-primary text-xs px-5 py-2.5 gap-2 flex-shrink-0"
            aria-label={ar ? "تنزيل تطبيق أندرويد" : "Download Android app"}
          >
            <span aria-hidden="true">⬇</span>
            {t("nav.download")}
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid sm:grid-cols-3 gap-5 text-xs text-slate-500 dark:text-slate-400">
        {/* Brand */}
        <div>
          <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-1">{t("app.name")}</div>
          <p className="leading-relaxed">{t("footer.note")}</p>
          <p className="mt-2 text-[11px]">© {year} ZAIan Studio</p>
        </div>

        {/* Links */}
        <div>
          <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-2">
            {ar ? "روابط" : "Links"}
          </div>
          <ul className="space-y-1.5">
            {[
              { href: "/workspace", label_en: "Workspace",    label_ar: "مساحة العمل" },
              { href: "/library",   label_en: "Library",      label_ar: "المكتبة" },
              { href: "/learn",     label_en: "Learn",        label_ar: "تعلَّم" },
              { href: "/download",  label_en: "Android App",  label_ar: "تطبيق أندرويد" },
              { href: "/privacy",   label_en: "Privacy",      label_ar: "الخصوصية" },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {ar ? l.label_ar : l.label_en}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={ar ? "" : "sm:text-end"}>
          <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-1">{t("footer.contact_title")}</div>
          <p>
            <a
              href={CONTACT_MAILTO}
              className="text-brand-700 dark:text-brand-300 hover:underline break-all"
              aria-label={ar ? `راسلنا على ${CONTACT_EMAIL}` : `Email us at ${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-1">{t("footer.contact_note")}</p>
          <p className="mt-3 text-[11px] flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              🇦🇪 {ar ? "صُنع في الإمارات" : "Made in UAE"}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
