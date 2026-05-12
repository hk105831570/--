import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // 生成随机6位验证码（字母+数字）
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    await prisma.case.update({
      where: { id },
      data: { accessCode: code },
    });

    return NextResponse.json({ accessCode: code });
  } catch (error) {
    console.error("Failed to generate code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
