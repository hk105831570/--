import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createXhOrder } from "@/lib/xunhupay";
import { calculateRisk } from "@/lib/calculateRisk";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { basicInfo, session, plan } = body;

    if (!session || !session.answers || !session.answers.length) {
      return NextResponse.json({ error: "缺少诊断数据" }, { status: 400 });
    }

    const planConfig: Record<string, { price: number; title: string }> = {
      complete: { price: 9.9, title: "劳动纠纷诊断-完整方案版" },
    };
    const config = planConfig[plan || "complete"];
    if (!config) {
      return NextResponse.json({ error: "无效的方案" }, { status: 400 });
    }

    // 环境变量
    const appid = process.env.XUNHUPAY_APPID || "";
    const appsecret = process.env.XUNHUPAY_APPSECRET || "";
    const notifyUrl = process.env.XUNHUPAY_NOTIFY_URL || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.laodongjiufen.xin";

    if (!appid || !appsecret || !notifyUrl) {
      return NextResponse.json({ error: "支付配置不完整，请联系管理员" }, { status: 500 });
    }

    // 1. 保存诊断记录
    const riskResult = calculateRisk(session.answers, session.userRole);
    const accessToken = randomUUID();
    const basicInfoData = basicInfo ?? {};

    const case_ = await prisma.case.create({
      data: {
        userRole: session.userRole,
        sceneId: session.sceneId,
        sceneTitle: session.sceneTitle,
        basicInfo: JSON.stringify(basicInfoData),
        answers: JSON.stringify(session.answers),
        riskLevel: riskResult.level,
        riskScore: riskResult.score,
        riskResult: JSON.stringify(riskResult),
        accessToken,
      },
    });

    // 2. 创建支付订单
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    const outTradeNo = `LD${timestamp}${random}`;
    const returnUrl = `${siteUrl}/complete-report`;

    const orderResult = await createXhOrder({
      appid,
      appsecret,
      tradeOrderId: outTradeNo,
      totalFee: config.price,
      title: config.title,
      notifyUrl,
      returnUrl,
      attach: case_.id,
    });

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.errMsg || "下单失败" }, { status: 500 });
    }

    // 3. 保存订单
    await prisma.order.create({
      data: {
        caseId: case_.id,
        outTradeNo,
        totalFee: Math.round(config.price * 100),
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      caseId: case_.id,
      accessToken,
      qrcode: orderResult.urlQrcode,
      url: orderResult.url,
      out_trade_no: outTradeNo,
      total_fee: config.price,
    });
  } catch (error) {
    console.error("Failed to create payment order:", error);
    return NextResponse.json({ error: "创建支付订单失败" }, { status: 500 });
  }
}
