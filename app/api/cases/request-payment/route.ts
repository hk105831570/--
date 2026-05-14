import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCaseAccess } from "@/lib/validate-access";

export async function POST(req: NextRequest) {
  try {
    const { caseId, email } = await req.json();
    const accessToken = req.headers.get("x-access-token") || "";

    if (!caseId || !email) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // 简单邮箱格式校验
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 验证访问权限
    const validation = await validateCaseAccess(caseId, accessToken);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // 检查案例状态
    const case_ = await prisma.case.findUnique({ where: { id: caseId } });
    if (!case_) {
      return NextResponse.json({ error: "诊断记录无效" }, { status: 404 });
    }

    if (case_.paymentVerified) {
      return NextResponse.json({ success: true, message: "已完成支付" });
    }

    // 保存邮箱并标记为待确认
    await prisma.case.update({
      where: { id: caseId },
      data: {
        email,
        paymentRequestedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "已提交，请等待管理员确认" });
  } catch (error) {
    console.error("Failed to request payment:", error);
    return NextResponse.json({ error: "请求失败" }, { status: 500 });
  }
}
