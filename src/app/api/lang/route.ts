import { NextResponse, type NextRequest } from "next/server";

const ONE_YEAR = 365 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const lang = form?.get("lang");
  const next = (form?.get("next") as string | null) || "/";
  const value = lang === "ar" ? "ar" : "en";

  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set("wasl.lang", value, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}
