import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
    }

    const existing = await prisma.case.findUnique({ where: { id: caseId } });
    if (!existing) {
      return NextResponse.json({ error: "诊断记录无效" }, { status: 404 });
    }

    // 如果已有验证码且未过期，直接返回
    if (existing.accessCode) {
      return NextResponse.json({ accessCode: existing.accessCode });
    }

    // 生成随机6位验证码（大写字母+数字，排除易混淆字符）
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    await prisma.case.update({
      where: { id: caseId },
      data: { accessCode: code },
    });

    return NextResponse.json({ accessCode: code });
  } catch (error) {
    console.error("Failed to generate code:", error);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}
