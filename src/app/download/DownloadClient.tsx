"use client";

import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const APK_URL = "/zaian-studio.apk"; // served from /public once uploaded
const PLAY_URL = "#"; // placeholder until Play Store listing

export default function DownloadClient() {
  const t = useT();
  const { locale } = useI18n();
  const ar = locale === "ar";

  function handlePWA() {
    // Trigger the browser's beforeinstallprompt if available.
    const ev = (window as unknown as { __pwaPrompt?: { prompt: () => void } }).__pwaPrompt;
    if (ev) { ev.prompt(); return; }
    alert(
      ar
        ? "افتح المتصفح، اضغط على القائمة ← «إضافة إلى الشاشة الرئيسية»"
        : "Open your browser menu → 'Add to Home Screen'"
    );
  }

  return (
    <>
      <Header />
      <main id="main" className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-10 text-center">
          {/* App icon */}
          <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-gradient-to-br from-brand-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-brand-500/30">
            <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true">
              <path d="M11 17 L19 24 L11 31" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="20" y="31.5" width="17" height="2.5" rx="1.25" fill="white" opacity="0.55"/>
              <path d="M34 11 L36 17 L42 19 L36 21 L34 27 L32 21 L26 19 L32 17 Z" fill="white" opacity="0.92"/>
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            {ar ? "مجاني · بدون إعلانات" : "Free · No ads"}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {ar ? (
              <>
                <span className="text-gradient">زيان ستوديو</span>
                <br />على الأندرويد
              </>
            ) : (
              <>
                <span className="text-gradient">ZAIan Studio</span>
                <br />for Android
              </>
            )}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t("download.subtitle")}
          </p>

          {/* Primary CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={APK_URL}
              download
              className="btn-primary text-base px-7 py-3.5 gap-3 w-full sm:w-auto justify-center shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all"
              aria-label={ar ? "تنزيل ملف APK لأندرويد" : "Download Android APK"}
            >
              <AndroidIcon className="w-6 h-6" />
              <span>
                <span className="block text-sm font-semibold opacity-80">{ar ? "تنزيل مباشر" : "Direct download"}</span>
                <span className="block text-base font-black">{t("download.apk.label")}</span>
              </span>
            </a>

            <button
              onClick={handlePWA}
              className="btn-secondary text-base px-7 py-3.5 gap-3 w-full sm:w-auto justify-center"
              aria-label={ar ? "أضف إلى الشاشة الرئيسية" : "Add to home screen"}
            >
              <span className="text-2xl" aria-hidden="true">🌐</span>
              <span>
                <span className="block text-sm font-semibold opacity-70">{ar ? "بدون تثبيت" : "No install"}</span>
                <span className="block text-base font-black">{t("download.pwa.label")}</span>
              </span>
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {t("download.apk.note")}
          </p>
        </section>

        {/* Feature grid */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "✏️", en: "Full Workspace",     ar: "مساحة العمل الكاملة",    body_en: "All 11 prompt methods, scoring, and history — same as the web app.", body_ar: "جميع الأساليب الأحد عشر والتقييم والسجل — مطابق لتطبيق الويب." },
              { icon: "📶", en: "Works Offline",       ar: "يعمل بلا إنترنت",        body_en: "Your drafts and library stay available even without a connection.", body_ar: "مسوداتك ومكتبتك متاحة دائماً حتى بلا اتصال." },
              { icon: "🌗", en: "Dark Mode",           ar: "الوضع الليلي",           body_en: "Automatic light and dark mode following your device setting.", body_ar: "التبديل التلقائي بين الوضع الفاتح والداكن وفق إعداد جهازك." },
              { icon: "🇦🇪", en: "Arabic RTL Layout",  ar: "واجهة عربية كاملة",      body_en: "Full right-to-left layout with Cairo typeface for Arabic.", body_ar: "واجهة مكتوبة من اليمين إلى اليسار بخط Cairo الاحترافي." },
              { icon: "🎙️", en: "Voice Input",        ar: "الإدخال الصوتي",         body_en: "Speak your prompt idea and let the app transcribe and build it.", body_ar: "انطق فكرتك والتطبيق يحوّلها إلى موجّه منظم." },
              { icon: "🔒", en: "Private by Default",  ar: "خصوصية بالاساس",        body_en: "No account needed. Your prompts stay on your device.", body_ar: "لا تحتاج لحساب. موجّهاتك تبقى على جهازك فقط." },
            ].map((f) => (
              <div key={f.en} className="card group hover:shadow-card-hover transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform" aria-hidden="true">
                  {f.icon}
                </div>
                <div className="mt-3 font-bold text-slate-900 dark:text-white text-sm">{ar ? f.ar : f.en}</div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ar ? f.body_ar : f.body_en}</p>
              </div>
            ))}
          </div>
        </section>

        {/* iOS coming soon + install guide */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center">
            <span className="text-3xl" aria-hidden="true">🍎</span>
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{t("download.ios.label")}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("download.ios.note")}</p>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                {ar ? "كيفية تثبيت APK على أندرويد" : "How to install the APK on Android"}
              </h3>
              <ol className={`text-sm text-slate-600 dark:text-slate-300 space-y-2 ${ar ? "text-right" : "text-left"} max-w-sm mx-auto`}>
                {(ar ? [
                  "نزّل ملف APK بالضغط على الزر أعلاه",
                  "افتح الملف من مجلد التنزيلات",
                  "اسمح بتثبيت التطبيقات من مصادر خارجية عند الطلب",
                  "اضغط «تثبيت» واستمتع بالتطبيق",
                ] : [
                  "Download the APK using the button above",
                  "Open the file from your Downloads folder",
                  "Allow installation from unknown sources if prompted",
                  "Tap Install and you are ready",
                ]).map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.523 15.341a.87.87 0 01-.87-.87V9.53a.87.87 0 011.74 0v4.94a.87.87 0 01-.87.87zm-11.046 0a.87.87 0 01-.87-.87V9.53a.87.87 0 011.74 0v4.94a.87.87 0 01-.87.87zM8.1 7.1A5.92 5.92 0 0112 5.5a5.92 5.92 0 013.9 1.6L17.5 5.5l-1.09-1.09-1.35 1.35A7.36 7.36 0 0012 4a7.36 7.36 0 00-3.06.76L7.59 3.41 6.5 4.5l1.6 1.6zM9.5 9a.75.75 0 100 1.5.75.75 0 000-1.5zm5 0a.75.75 0 100 1.5.75.75 0 000-1.5zm-9.5 1.5v6.25A1.25 1.25 0 006.25 18H7v2.25A1.25 1.25 0 008.25 21.5h.5A1.25 1.25 0 0010 20.25V18h4v2.25a1.25 1.25 0 001.25 1.25h.5A1.25 1.25 0 0017 20.25V18h.75A1.25 1.25 0 0019 16.75V10.5H5z"/>
    </svg>
  );
}
