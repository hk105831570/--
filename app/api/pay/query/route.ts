import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCaseAccess } from "@/lib/validate-access";

export async function GET(req: NextRequest) {
  try {
    const caseId = req.nextUrl.searchParams.get("caseId") || "";
    const accessToken = req.headers.get("x-access-token") || "";

    if (!caseId) {
      return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
    }

    // 验证访问权限
    const validation = await validateCaseAccess(caseId, accessToken);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // 查询案例支付状态
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!case_) {
      return NextResponse.json({ error: "诊断记录无效" }, { status: 404 });
    }

    const latestOrder = case_.orders[0] || null;

    return NextResponse.json({
      paymentVerified: case_.paymentVerified,
      order: latestOrder
        ? {
            outTradeNo: latestOrder.outTradeNo,
            status: latestOrder.status,
            totalFee: latestOrder.totalFee,
            payTime: latestOrder.payTime,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to query payment:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
