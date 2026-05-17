import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single();
  return NextResponse.json(data);
}
