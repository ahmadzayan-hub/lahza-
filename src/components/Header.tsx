"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import ThemeToggle from "@/components/ThemeToggle";
import ShareApp from "@/components/ShareApp";

interface NavItem {
  href: string;
  label_en: string;
  label_ar: string;
  icon: string;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/workspace",  label_en: "Workspace",  label_ar: "مساحة العمل",  icon: "✏️" },
  { href: "/library",    label_en: "Library",     label_ar: "المكتبة",       icon: "📚" },
  { href: "/dashboard",  label_en: "Dashboard",   label_ar: "التحكم",        icon: "📊" },
  { href: "/templates",  label_en: "Templates",   label_ar: "القوالب",       icon: "📋" },
  { href: "/learn",      label_en: "Learn",        label_ar: "تعلّم",         icon: "🎓" },
  { href: "/settings",   label_en: "Settings",    label_ar: "الإعدادات",     icon: "⚙️" },
];

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const otherLocale = locale === "en" ? "ar" : "en";
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 min-w-0 group" aria-label={t("app.name")}>
          <BrandMark />
          <BrandWordmark ar={ar} />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 text-sm">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavLink key={item.href} item={item} ar={ar} />
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <a
            href="/workspace"
            className="btn-primary text-xs px-4 py-2 gap-1.5"
            aria-label={ar ? "افتح مساحة العمل" : "Open Workspace"}
          >
            ✨ {ar ? "ابدأ الآن" : "Start Now"}
          </a>
          <span className="w-px h-5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          <ThemeToggle />
          <button
            onClick={() => setLocale(otherLocale)}
            className="btn-ghost border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-semibold"
            aria-label="Toggle language"
          >
            {t("lang.toggle")}
          </button>
          <ShareApp />
          <a href="/login" className="btn-ghost text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg">
            {t("nav.signin")}
          </a>
          <a href="/download" className="btn-ghost text-xs px-2.5 py-1.5 border border-brand-200 dark:border-brand-700 rounded-lg text-brand-700 dark:text-brand-300 hidden lg:flex items-center gap-1.5">
            <span aria-hidden="true">📱</span>
            <span>{t("nav.download")}</span>
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setLocale(otherLocale)}
            className="btn-ghost border border-slate-200 dark:border-slate-700 text-xs px-2 py-1.5"
            aria-label="Toggle language"
          >
            {t("lang.toggle")}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-ghost px-2 py-1.5 rounded-xl"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="18" x2="14" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              >
                <span>{item.icon}</span>
                <span>{ar ? item.label_ar : item.label_en}</span>
              </a>
            ))}
          </div>
          <div className="px-4 pb-3 flex gap-2 flex-wrap">
            <a href="/workspace" className="btn-primary text-xs px-4 py-2 flex-1 justify-center">
              ✨ {ar ? "ابدأ الآن" : "Start Now"}
            </a>
            <a href="/login" className="btn-ghost text-xs border border-slate-200 dark:border-slate-700 px-3 py-2">
              {t("nav.signin")}
            </a>
            <a href="/download" className="btn-ghost text-xs border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 px-3 py-2 flex items-center gap-1">
              📱 {t("nav.download")}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ item, ar }: { item: NavItem; ar: boolean }) {
  return (
    <a
      href={item.href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-brand-600 dark:hover:text-brand-400 transition-all group"
    >
      <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
      <span>{ar ? item.label_ar : item.label_en}</span>
    </a>
  );
}

function BrandMark() {
  return (
    <div className="relative flex-shrink-0">
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <defs>
          <linearGradient id="hdr-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/>
            <stop offset="55%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#ec4899"/>
          </linearGradient>
          <linearGradient id="hdr-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a"/>
            <stop offset="100%" stopColor="#ffffff"/>
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="11" fill="url(#hdr-bg)"/>
        {/* Chevron / prompt cursor */}
        <path d="M11 17 L19 24 L11 31" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.92"/>
        {/* Underline */}
        <rect x="20" y="31.5" width="17" height="2" rx="1" fill="white" opacity="0.5"/>
        {/* Star spark */}
        <path d="M34 11 L36 17 L42 19 L36 21 L34 27 L32 21 L26 19 L32 17 Z" fill="url(#hdr-spark)" opacity="0.95"/>
      </svg>
    </div>
  );
}

function BrandWordmark({ ar }: { ar: boolean }) {
  return (
    <div className="flex flex-col leading-tight min-w-0">
      <span className="text-base sm:text-lg font-black tracking-tight truncate">
        {ar ? (
          <span className="text-slate-900 dark:text-white">زيان</span>
        ) : (
          <>
            <span className="text-gradient">ZAI</span>
            <span className="text-slate-900 dark:text-white">an</span>
          </>
        )}
        <span className="font-light text-slate-400 dark:text-slate-500 ms-1.5 text-sm">
          {ar ? "ستوديو" : "Studio"}
        </span>
      </span>
      <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate hidden sm:block">
        {ar ? "منصة هندسة الموجّهات" : "Prompt Intelligence Platform"}
      </span>
    </div>
  );
}
