import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Runs on every request to keep the Supabase session fresh. Refreshes the
 * auth cookie before it expires so server components and API routes see a
 * valid user. No-op when Supabase env is not set.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, the SW, and known public files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js|demo.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
