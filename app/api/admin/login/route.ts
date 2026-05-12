import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, getCookieName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const token = getExpectedToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getCookieName(), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
