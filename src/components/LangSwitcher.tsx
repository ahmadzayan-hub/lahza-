"use client";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/config";

export default function LangSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || "/";
  const target: Locale = current === "ar" ? "en" : "ar";
  return (
    <form method="post" action="/api/lang" className="inline-flex">
      <input type="hidden" name="lang" value={target} />
      <input type="hidden" name="next" value={pathname} />
      <button
        type="submit"
        className="btn btn-ghost btn-sm"
        aria-label={target === "ar" ? "التبديل إلى العربية" : "Switch to English"}
      >
        {target === "ar" ? "العربية" : "English"}
      </button>
    </form>
  );
}
