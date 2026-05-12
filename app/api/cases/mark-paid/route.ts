import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { caseId, devKey } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
    }

    // 验证 dev 测试密钥
    const adminPw = process.env.ADMIN_PASSWORD;
    if (!devKey || devKey !== adminPw) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 更新支付状态
    await prisma.case.update({
      where: { id: caseId },
      data: { paymentVerified: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
