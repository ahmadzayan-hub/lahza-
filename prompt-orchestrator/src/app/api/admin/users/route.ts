export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUser } from "@/lib/db/supabase-server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json([
      { id: "demo-user-00000000-0000-0000-0000-000000000000", email: "sara@tweenz.ae", display_name: "Sara Al-Mansouri", role: "student", created_at: "2025-09-01T00:00:00.000Z", subscription: { plan: "pro", status: "active" } },
      { id: "u-002", email: "khalid@tweenz.ae", display_name: "Khalid Al-Rashidi", role: "student", created_at: "2025-09-15T00:00:00.000Z", subscription: { plan: "student", status: "active" } },
      { id: "u-003", email: "layla@tweenz.ae", display_name: "Layla Hassan", role: "student", created_at: "2025-10-01T00:00:00.000Z", subscription: { plan: "student", status: "trialing" } },
      { id: "u-004", email: "admin@tweenz.ae", display_name: "Platform Admin", role: "admin", created_at: "2025-08-01T00:00:00.000Z", subscription: { plan: "pro", status: "active" } },
    ]);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userData?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await supabase.from("users").select("id, email, display_name, role, created_at, subscriptions(plan, status)").order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(data ?? []);
}
