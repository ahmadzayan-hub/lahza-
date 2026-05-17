"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap, BookOpen, Bot, BarChart3, Clock, Globe2, Newspaper,
  HelpCircle, Upload, Sparkles, ChevronRight, Check, Star
} from "lucide-react";

export default function HomePage() {
  const { t } = useI18n();

  const features = [
    { icon: <BookOpen size={22} />,  key: "dashboard",    color: "bg-brand-100 text-brand-600" },
    { icon: <Bot size={22} />,       key: "ai_tutor",     color: "bg-teal-100 text-teal-600" },
    { icon: <Sparkles size={22} />,  key: "study_packs",  color: "bg-purple-100 text-purple-600" },
    { icon: <BarChart3 size={22} />, key: "grades",       color: "bg-emerald-100 text-emerald-600" },
    { icon: <Clock size={22} />,     key: "deadlines",    color: "bg-amber-100 text-amber-600" },
    { icon: <Globe2 size={22} />,    key: "bilingual",    color: "bg-rose-100 text-rose-600" },
    { icon: <Newspaper size={22} />, key: "weekly_brief", color: "bg-indigo-100 text-indigo-600" },
    { icon: <HelpCircle size={22} />,key: "ask_mba",      color: "bg-cyan-100 text-cyan-600" },
  ];

  const steps = [1, 2, 3, 4, 5, 6];

  const plans = [
    { key: "free",    highlight: false },
    { key: "student", highlight: true  },
    { key: "pro",     highlight: false },
  ];

  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-teal-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -end-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -start-32 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="text-base">🇦🇪</span>
            <span className="text-white/90">{t("home.pill")}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
            {t("home.hero.title").split("\n").map((line, i) => (
              <span key={i} className={i === 0 ? "block" : "block text-teal-300"}>{line}</span>
            ))}
          </h1>

          <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("home.hero.subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-3.5 rounded-xl text-base transition shadow-lg hover:shadow-xl">
                <GraduationCap size={20} />
                {t("home.hero.cta_primary")}
              </button>
            </Link>
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-7 py-3.5 rounded-xl text-base transition">
                <Upload size={18} />
                {t("home.hero.cta_secondary")}
              </button>
            </Link>
          </div>

          <p className="text-sm text-white/50">{t("home.hero.badge")}</p>

          {/* Dashboard preview mockup */}
          <div className="mt-16 mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/80 backdrop-blur">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ms-3 text-xs text-slate-400">www.learniq.ae — Dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Courses", value: "6", color: "text-brand-400" },
                { label: "Upcoming Deadlines", value: "3", color: "text-amber-400" },
                { label: "Exam Readiness", value: "78%", color: "text-emerald-400" },
                { label: "Study Pack Generated", value: "12", color: "text-teal-400" },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-4 text-start">
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-start">
                <p className="text-xs text-slate-400 mb-3">AI Study Recommendation</p>
                <p className="text-sm text-white/80">Revise Strategic Management Lecture 3 — exam in 5 days. Your readiness score is 72%. Focus on Porter Five Forces and SWOT analysis.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-start">
                <p className="text-xs text-slate-400 mb-3">Recent Announcement</p>
                <p className="text-sm text-white/80">Assignment 2 deadline extended to next Sunday. Submit via Moodle before 11:59 PM Gulf time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {t("home.how.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map(n => (
              <div key={n} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {t(`home.how.step${n}.title` as any)}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(`home.how.step${n}.body` as any)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {t("home.features.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.key} className="card group">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {t(`home.features.${f.key}.title` as any)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`home.features.${f.key}.body` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[0,1,2,3,4].map(i => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {t("home.social_proof.title")}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            {t("home.social_proof.subtitle")}
          </p>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            {[
              {
                quote: "Finally an AI tool that actually reads my lecture slides and gives me cited answers. The study packs save me hours every week.",
                name: "MBA Student, UAE University",
                avatar: "FS"
              },
              {
                quote: "The weekly brief tells me exactly what's at risk and what to study. It's like having a smart study coach.",
                name: "Online MBA, Gulf Region",
                avatar: "AK"
              },
              {
                quote: "الواجهة العربية ممتازة وطبيعية تماماً. المدرب الذكي يفهم مواد مقرري ويجيب بدقة.",
                name: "طالب ماجستير، الإمارات",
                avatar: "مح"
              },
            ].map((t, i) => (
              <div key={i} className="card">
                <div className="flex gap-1 mb-3">
                  {[0,1,2,3,4].map(j => <Star key={j} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ───────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {t("home.pricing.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">{t("home.pricing.trial")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const featureList = (t(`pricing.${plan.key}.features` as any) as string).split(",");
              return (
                <div key={plan.key} className={`relative card text-start ${plan.highlight ? "border-2 border-brand-500 shadow-card-lg" : ""}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                      <span className="badge-blue text-xs font-semibold px-3 py-1 rounded-full shadow">
                        {t("pricing.popular")}
                      </span>
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      {t(`pricing.${plan.key}.name` as any)}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                        ${t(`pricing.${plan.key}.price_monthly` as any)}
                      </span>
                      <span className="text-slate-400 pb-1">{t("pricing.per_month")}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {t(`pricing.${plan.key}.description` as any)}
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {featureList.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Check size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f.trim()}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      variant={plan.highlight ? "primary" : "secondary"}
                      fullWidth
                    >
                      {t(plan.key === "free" ? "pricing.cta.free" : "pricing.cta.paid")}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-sm text-slate-400">{t("pricing.trial_note")}</p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-brand-700 to-teal-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            Ready to organize your MBA with AI?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Join thousands of MBA students who use LearnIQ to study smarter, manage deadlines, and improve their grades.
          </p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-4 rounded-xl text-base transition shadow-lg">
              <GraduationCap size={20} />
              {t("home.hero.cta_primary")}
              <ChevronRight size={18} />
            </button>
          </Link>
          <p className="mt-4 text-sm text-white/40">{t("home.hero.badge")}</p>
        </div>
      </section>
    </div>
  );
}
