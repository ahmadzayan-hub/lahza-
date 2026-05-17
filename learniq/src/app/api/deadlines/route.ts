import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const view = req.nextUrl.searchParams.get("view") ?? "week";
  const supabase = createClient();
  let q = supabase.from("deadlines").select("*, courses(name)").eq("user_id", user.id).eq("is_done", false).order("due_date");
  if (view === "today") q = q.lte("due_date", new Date(Date.now() + 86400000).toISOString());
  else if (view === "week") q = q.lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString());
  else if (view === "month") q = q.lte("due_date", new Date(Date.now() + 30 * 86400000).toISOString());
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.map(d => ({ ...d, course_name: (d.courses as any)?.name ?? "" })) ?? []);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const supabase = createClient();
  const { data, error } = await supabase.from("deadlines").insert({ ...body, user_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
