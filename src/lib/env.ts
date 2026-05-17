// Client-safe environment values.
// IMPORTANT: This module is bundled with the browser. Only reference
// public env vars (NEXT_PUBLIC_*) here. Server-only secrets such as
// SUPABASE_SERVICE_ROLE_KEY or OPENAI_API_KEY MUST NOT appear here —
// even reading them by name puts their identifiers into the client
// bundle. Put those in `env.server.ts` (server modules only).
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
};

export function assertSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
    );
  }
}
