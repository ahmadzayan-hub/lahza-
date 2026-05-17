"use client";
import { Menu, Bell, Search, Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useState, useEffect } from "react";

interface AppHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  const { t, locale, setLocale } = useI18n();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tz_theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 sm:px-6 gap-3">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden btn-ghost p-2"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
          {title}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="btn-ghost text-xs px-2.5 py-1.5 font-medium"
          aria-label="Toggle language"
        >
          {t("lang.toggle")}
        </button>

        {/* Theme */}
        <button onClick={toggleTheme} className="btn-ghost p-2" aria-label="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications placeholder */}
        <button className="btn-ghost p-2 relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
