import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();

  const { data, error } = await supabase
    .from("deadlines")
    .update(body)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
