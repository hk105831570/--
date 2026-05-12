import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { caseId, code } = await req.json();

    if (!caseId || !code) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // 查找该 case 并验证验证码
    const case_ = await prisma.case.findUnique({ where: { id: caseId } });

    if (!case_) {
      return NextResponse.json({ error: "诊断记录无效" }, { status: 404 });
    }

    if (!case_.accessCode) {
      return NextResponse.json({ error: "该诊断尚未生成验证码，请联系客服" }, { status: 400 });
    }

    if (case_.accessCode !== code.toUpperCase()) {
      return NextResponse.json({ error: "验证码错误，请重新输入" }, { status: 403 });
    }

    // 验证码正确，标记为已支付
    await prisma.case.update({
      where: { id: caseId },
      data: { paymentVerified: true },
    });

    return NextResponse.json({ success: true, message: "验证成功" });
  } catch (error) {
    console.error("Failed to verify code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
