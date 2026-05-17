"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { t } = useI18n();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm_password") as string;
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("error.generic")); return; }
      window.location.href = `/verify?email=${encodeURIComponent(fd.get("email") as string)}`;
    } catch {
      setError(t("error.network"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("auth.signup.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("auth.signup.subtitle")}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t("auth.signup.name")}
          </label>
          <input name="name" type="text" required autoComplete="name" placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t("auth.signup.email")}
          </label>
          <input name="email" type="email" required autoComplete="email" placeholder="your@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t("auth.signup.password")}
          </label>
          <div className="relative">
            <input name="password" type={showPw ? "text" : "password"} required autoComplete="new-password" placeholder="Min. 8 characters" className="pe-10" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Toggle">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t("auth.signup.confirm_password")}
          </label>
          <input name="confirm_password" type={showPw ? "text" : "password"} required autoComplete="new-password" placeholder="Repeat password" />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {t("auth.signup.terms")}{" "}
          <Link href="/terms" className="text-brand-600 hover:underline dark:text-brand-400">{t("auth.signup.terms_link")}</Link>
          {" "}{t("auth.signup.and")}{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline dark:text-brand-400">{t("auth.signup.privacy_link")}</Link>.
        </p>

        <Button type="submit" fullWidth loading={loading}>
          {loading ? t("auth.signup.loading") : t("auth.signup.submit")}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">{t("label.or")}</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      <button
        onClick={() => window.location.href = "/api/auth/google"}
        className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t("auth.signup.google")}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t("auth.signup.have_account")}{" "}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium dark:text-brand-400">
          {t("auth.signup.login_link")}
        </Link>
      </p>
    </div>
  );
}
