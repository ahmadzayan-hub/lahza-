// Server-only helpers. Do not import from client components.
import { cookies } from "next/headers";
import type { Locale } from "./config";
import { SITE } from "./config";

export function getLocale(): Locale {
  try {
    const c = cookies().get("wasl.lang")?.value;
    if (c === "ar" || c === "en") return c;
  } catch {
    // outside a request context
  }
  return SITE.defaultLocale;
}
