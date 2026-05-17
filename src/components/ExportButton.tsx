"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Props {
  content: string;
  filename?: string;
}

export default function ExportButton({ content, filename = "prismly-prompt" }: Props) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);

  function download(ext: "md" | "txt") {
    const blob = new Blob([content], { type: ext === "md" ? "text/markdown" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs sm:text-sm"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {locale === "ar" ? "تنزيل" : "Export"}
      </button>
      {open && (
        <div className="absolute end-0 top-full mt-1 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden min-w-[140px]">
          <button onClick={() => download("md")} className="block w-full text-start px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            .md ({locale === "ar" ? "ماركداون" : "Markdown"})
          </button>
          <button onClick={() => download("txt")} className="block w-full text-start px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            .txt ({locale === "ar" ? "نصّ عادي" : "Plain text"})
          </button>
        </div>
      )}
    </div>
  );
}
