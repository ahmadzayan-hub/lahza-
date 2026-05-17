import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

const SUPABASE_NOT_CONFIGURED =
  /Supabase env not configured|SUPABASE_SERVICE_ROLE_KEY not configured/i;

export function handleError(e: unknown): NextResponse {
  const msg = (e as Error)?.message ?? "";
  if (SUPABASE_NOT_CONFIGURED.test(msg)) {
    return NextResponse.json(
      { unavailable: true, reason: "backend_not_configured", message: msg },
      { status: 200 }
    );
  }
  console.error("[api]", e);
  return NextResponse.json({ error: "internal", message: msg }, { status: 500 });
}

export function safeRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse> | NextResponse
) {
  return async (...args: Args): Promise<NextResponse> => {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          unavailable: true,
          reason: "backend_not_configured",
          message: "Backend not configured — running in local mode."
        },
        { status: 200 }
      );
    }
    try {
      return await handler(...args);
    } catch (e) {
      return handleError(e);
    }
  };
}
