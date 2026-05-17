export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`);
  }

  return NextResponse.redirect(data.url);
}
