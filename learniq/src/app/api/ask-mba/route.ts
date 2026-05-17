import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/db/supabase-server";
import { aiChat } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { query } = await req.json();
  const supabase = createClient();

  // Gather academic context
  const [courses, deadlines, announcements, grades] = await Promise.all([
    supabase.from("courses").select("name, code, progress, status").eq("user_id", user.id).limit(10),
    supabase.from("deadlines").select("title, due_date, risk, type, courses(name)").eq("user_id", user.id).eq("is_done", false).order("due_date").limit(10),
    supabase.from("announcements").select("title, summary, risk_level, courses(name)").eq("user_id", user.id).eq("is_archived", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("grades").select("category, item_name, score, max_score, weight, courses(name)").eq("user_id", user.id).limit(20),
  ]);

  const context = `
STUDENT ACADEMIC DATA:

COURSES:
${courses.data?.map((c: any) => `- ${c.name} (${c.code}) — Progress: ${c.progress}% — Status: ${c.status}`).join("\n") ?? "No courses"}

UPCOMING DEADLINES:
${deadlines.data?.map((d: any) => `- ${d.title} | ${(d.courses as any)?.name} | Due: ${d.due_date} | Risk: ${d.risk}`).join("\n") ?? "No deadlines"}

RECENT ANNOUNCEMENTS:
${announcements.data?.map((a: any) => `- ${a.title} | ${(a.courses as any)?.name} | Risk: ${a.risk_level} | ${a.summary}`).join("\n") ?? "No announcements"}

GRADES:
${grades.data?.map((g: any) => `- ${(g.courses as any)?.name} | ${g.category}: ${g.item_name} | ${g.score !== null ? `${g.score}/${g.max_score}` : "Pending"} | Weight: ${g.weight}%`).join("\n") ?? "No grades"}
`;

  const response = await aiChat([
    { role: "system", content: `You are "Ask My MBA" — a smart academic advisor agent for an MBA student. You have access to the student's full academic data. Answer their questions directly and helpfully. Be concise but thorough. Always refer to specific courses, deadlines, or grades from the data when relevant. Format your response clearly with sections if needed.` },
    { role: "user", content: `${context}\n\nStudent question: ${query}` },
  ], { maxTokens: 1500, temperature: 0.3 });

  await supabase.from("ai_usage_logs").insert({ user_id: user.id, operation: "ask_mba", model: process.env.AI_MODEL ?? "claude-sonnet-4-6", input_tokens: 800, output_tokens: 400, success: true });

  return NextResponse.json({ answer: response });
}
