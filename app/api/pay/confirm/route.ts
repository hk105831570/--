import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
    }

    // 查找该案例最新的待支付订单
    const order = await prisma.order.findFirst({
      where: { caseId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      // 可能已经支付过了
      const existing = await prisma.case.findUnique({ where: { id: caseId } });
      if (existing?.paymentVerified) {
        return NextResponse.json({ success: true, message: "已完成支付" });
      }
      return NextResponse.json({ error: "未找到待支付订单" }, { status: 404 });
    }

    // 手动确认支付
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", payTime: new Date() },
    });

    await prisma.case.update({
      where: { id: caseId },
      data: { paymentVerified: true },
    });

    console.log(`Manual payment confirm: order=${order.outTradeNo}, case=${caseId}`);

    return NextResponse.json({ success: true, message: "支付确认成功" });
  } catch (error) {
    console.error("Manual payment confirm error:", error);
    return NextResponse.json({ error: "确认失败" }, { status: 500 });
  }
}
