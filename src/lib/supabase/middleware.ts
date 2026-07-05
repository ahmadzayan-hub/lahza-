import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

interface CookieEntry { name: string; value: string; options?: CookieOptions }

/**
 * Refresh the Supabase session cookie before it expires.
 * Called from Next.js middleware on every request that matches the config.
 * If Supabase env is not set, this is a no-op (the local engine still works).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers }
  });

  if (!env.supabaseUrl || !env.supabaseAnonKey) return supabaseResponse;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieEntry[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    }
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}
