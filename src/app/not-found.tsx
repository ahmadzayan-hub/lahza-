import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Not found · 404"
};

/**
 * Branded 404 page. Bilingual copy so it works regardless of locale.
 * Server-rendered so it costs nothing at runtime.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo className="w-14 h-14 rounded-2xl shadow" />
        </div>
        <p className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          404
        </p>
        <h1 className="mt-3 text-xl font-semibold text-slate-800 dark:text-slate-100">
          Page not found
        </h1>
        <p
          className="mt-1 text-sm text-slate-600 dark:text-slate-300"
          lang="ar"
          dir="rtl"
        >
          الصفحة التي تبحث عنها غير موجودة.
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          The page you are looking for does not exist.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/workspace" className="btn-ghost border border-slate-300 dark:border-slate-700">
            Open workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
