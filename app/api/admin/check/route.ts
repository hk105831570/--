import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const authed = await isAdmin();
  if (!authed) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  return NextResponse.json({ authed: true });
}
