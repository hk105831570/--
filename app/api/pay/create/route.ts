import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createXhOrder } from "@/lib/xunhupay";
import { validateCaseAccess } from "@/lib/validate-access";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, plan } = body; // plan: "complete" | "review"
    const accessToken = req.headers.get("x-access-token") || "";

    if (!caseId) {
      return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
    }

    // 验证访问权限
    const validation = await validateCaseAccess(caseId, accessToken);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // 检查是否已支付
    const existing = await prisma.case.findUnique({ where: { id: caseId } });
    if (!existing) {
      return NextResponse.json({ error: "诊断记录无效" }, { status: 404 });
    }
    if (existing.paymentVerified) {
      return NextResponse.json({ success: true, qrcode: null, message: "已完成支付" });
    }

    // 根据方案确定价格（单位：元）
    const planConfig: Record<string, { price: number; title: string }> = {
      complete: { price: 9.9, title: "劳动纠纷诊断-完整方案版" },
      review: { price: 499, title: "劳动纠纷诊断-人工复核版" },
    };
    const config = planConfig[plan || "complete"];
    if (!config) {
      return NextResponse.json({ error: "无效的方案" }, { status: 400 });
    }

    // 检查是否已有未支付订单
    const pendingOrder = await prisma.order.findFirst({
      where: { caseId, status: "pending" },
    });

    if (pendingOrder) {
      // 已有未支付订单，直接重新创建（虎皮椒不提供订单查询API，走重新下单流程）
      await prisma.order.update({
        where: { id: pendingOrder.id },
        data: { status: "closed" },
      });
    }

    // 环境变量
    const appid = process.env.XUNHUPAY_APPID || "";
    const appsecret = process.env.XUNHUPAY_APPSECRET || "";
    const notifyUrl = process.env.XUNHUPAY_NOTIFY_URL || "";
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/complete-report`;

    if (!appid || !appsecret || !notifyUrl) {
      return NextResponse.json({ error: "支付配置不完整，请联系管理员" }, { status: 500 });
    }

    // 生成商户订单号
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    const outTradeNo = `LD${timestamp}${random}`;

    // 调用虎皮椒下单
    const orderResult = await createXhOrder({
      appid,
      appsecret,
      tradeOrderId: outTradeNo,
      totalFee: config.price,
      title: config.title,
      notifyUrl,
      returnUrl,
      attach: caseId, // 附上 caseId 方便回调时查找
    });

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.errMsg || "下单失败" }, { status: 500 });
    }

    // 保存订单到数据库
    await prisma.order.create({
      data: {
        caseId,
        outTradeNo,
        totalFee: Math.round(config.price * 100), // 转分为单位存储
        status: "pending",
      },
    });

    // 返回支付二维码给前端
    return NextResponse.json({
      success: true,
      qrcode: orderResult.urlQrcode,     // PC 扫码支付二维码
      url: orderResult.url,              // 手机端跳转链接
      out_trade_no: outTradeNo,
      total_fee: config.price,
    });
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json({ error: "创建支付订单失败" }, { status: 500 });
  }
}
