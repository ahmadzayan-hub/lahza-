import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Runs on every request to keep the Supabase session fresh.
 * Refreshes the auth cookie before it expires so server components
 * and API routes see a valid user. Skips crawler files, static assets,
 * the service worker, the demo page, and any file with a common asset
 * extension.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!" +
      // Next internals
      "_next/static|_next/image|" +
      // Crawler / metadata endpoints (do NOT wrap with session refresh)
      "robots.txt|sitemap.xml|llms.txt|" +
      // PWA files
      "favicon.ico|icon.svg|manifest.webmanifest|sw.js|" +
      // Static preview page
      "demo.html|" +
      // Any asset by extension
      ".*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff|woff2)$" +
    ").*)"
  ]
};
