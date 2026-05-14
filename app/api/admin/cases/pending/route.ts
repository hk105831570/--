import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const cases = await prisma.case.findMany({
      where: {
        paymentRequestedAt: { not: null },
        paymentVerified: false,
      },
      orderBy: { paymentRequestedAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        userRole: true,
        sceneTitle: true,
        riskLevel: true,
        email: true,
        paymentRequestedAt: true,
      },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Failed to fetch pending cases:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
