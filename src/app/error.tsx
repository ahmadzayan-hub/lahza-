"use client";

import { useEffect } from "react";
import Logo from "@/components/Logo";

/**
 * Client-side error boundary for any route under app/*.
 * Next.js renders this when a client component throws.
 * Keep it copy-light and free of external data fetches.
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Best-effort telemetry hook. Replace with your own reporter later.
    if (typeof console !== "undefined") console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo className="w-14 h-14 rounded-2xl shadow" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Something went wrong
        </h1>
        <p
          className="mt-1 text-sm text-slate-600 dark:text-slate-300"
          lang="ar"
          dir="rtl"
        >
          حدث خطأ غير متوقَّع. يُرجى المحاولة مرّة أخرى.
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          {error.digest ?? error.message.slice(0, 120)}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <a href="/" className="btn-ghost border border-slate-300 dark:border-slate-700">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
