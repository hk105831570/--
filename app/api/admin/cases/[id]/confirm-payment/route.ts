import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员身份
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    const case_ = await prisma.case.findUnique({ where: { id } });
    if (!case_) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    if (case_.paymentVerified) {
      return NextResponse.json({ success: true, message: "已支付完成" });
    }

    if (!case_.email) {
      return NextResponse.json({ error: "该案例没有邮箱信息，请让用户先提交邮箱" }, { status: 400 });
    }

    // 生成 6 位验证码
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // 发送验证码到用户邮箱
    try {
      await sendVerificationCode(case_.email, code, case_.sceneTitle);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json({ error: "邮件发送失败，请检查 SMTP 配置" }, { status: 500 });
    }

    // 更新案例状态
    await prisma.case.update({
      where: { id },
      data: {
        paymentVerified: true,
        verificationCode: code,
        verificationSentAt: new Date(),
        accessCode: code, // 兼容旧的验证码验证逻辑
      },
    });

    return NextResponse.json({
      success: true,
      message: `确认成功，验证码已发送至 ${case_.email}`,
      email: case_.email,
    });
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    return NextResponse.json({ error: "确认失败" }, { status: 500 });
  }
}
