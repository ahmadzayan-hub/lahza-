import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";
import { aiChat } from "@/lib/ai/client";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const supabase = createClient();
  const { data, error } = await supabase.from("announcements").select("*, courses(name)").eq("user_id", user.id).eq("is_archived", false).order("created_at", { ascending: false }).limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.map(a => ({ ...a, course_name: (a.courses as any)?.name ?? "" })) ?? []);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const supabase = createClient();

  let { title, content, course_id, source } = body;
  let summary = "", required_action = "", risk_level = "low";

  // AI analysis if content provided
  if (content && content.length > 20) {
    try {
      const aiResponse = await aiChat([
        { role: "system", content: "You are an academic announcement analyzer for MBA students. Analyze the announcement and respond with a JSON object: {summary, required_action, deadline, risk_level (low|medium|high|critical), type (academic|admin|assignment|exam|urgent|general)}. Keep summary under 100 words." },
        { role: "user", content: `Analyze this announcement:\n\n${content}` },
      ], { maxTokens: 300 });
      const parsed = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, "").trim());
      summary = parsed.summary ?? "";
      required_action = parsed.required_action ?? "";
      risk_level = parsed.risk_level ?? "low";
    } catch {}
  }

  const { data, error } = await supabase.from("announcements").insert({
    user_id: user.id, course_id: course_id || null, title, body: content,
    source: source ?? "manual", summary, required_action, risk_level,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
