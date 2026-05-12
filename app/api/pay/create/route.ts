import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createNativeOrder, queryOrder } from "@/lib/wechat-pay";
import { validateCaseAccess } from "@/lib/validate-access";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId } = body;
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
      return NextResponse.json({ success: true, code_url: null, message: "已完成支付" });
    }

    // 检查是否已有未支付订单
    const pendingOrder = await prisma.order.findFirst({
      where: { caseId, status: "pending" },
    });

    if (pendingOrder) {
      // 已经有订单，尝试查询微信侧状态
      const appid = process.env.WECHAT_APPID || "";
      const mch_id = process.env.WECHAT_MCH_ID || "";
      const apiKey = process.env.WECHAT_API_KEY || "";

      const queryResult = await queryOrder({
        appid,
        mch_id,
        apiKey,
        out_trade_no: pendingOrder.outTradeNo,
      });

      if (queryResult.success && queryResult.status === "SUCCESS") {
        // 已支付，更新状态
        await prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            status: "paid",
            transactionId: queryResult.transaction_id,
            payTime: queryResult.time_end ? new Date(queryResult.time_end.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6")) : new Date(),
          },
        });
        await prisma.case.update({
          where: { id: caseId },
          data: { paymentVerified: true },
        });
        return NextResponse.json({ success: true, code_url: null, message: "已完成支付" });
      }

      // 订单还在 pending，重新返回 code_url（但没法获取旧的 code_url 了）
      // 所以需要重新下单
    }

    // 如果有旧的 pending 订单，先关闭
    if (pendingOrder) {
      await prisma.order.update({
        where: { id: pendingOrder.id },
        data: { status: "closed" },
      });
    }

    // 环境变量
    const appid = process.env.WECHAT_APPID || "";
    const mch_id = process.env.WECHAT_MCH_ID || "";
    const apiKey = process.env.WECHAT_API_KEY || "";
    const notifyUrl = process.env.WECHAT_NOTIFY_URL || "";

    if (!appid || !mch_id || !apiKey || !notifyUrl) {
      return NextResponse.json({ error: "支付配置不完整，请联系管理员" }, { status: 500 });
    }

    // 生成商户订单号：前缀 + 时间戳 + 随机数
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    const outTradeNo = `LD${timestamp}${random}`;

    // 调用微信统一下单
    const orderResult = await createNativeOrder({
      appid,
      mch_id,
      apiKey,
      body: "劳动纠纷诊断报告",
      out_trade_no: outTradeNo,
      total_fee: 990, // ¥9.9 = 990分
      spbill_create_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1",
      notify_url: notifyUrl,
    });

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.errMsg || "下单失败" }, { status: 500 });
    }

    // 保存订单到数据库
    await prisma.order.create({
      data: {
        caseId,
        outTradeNo,
        totalFee: 990,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      code_url: orderResult.code_url,
      out_trade_no: outTradeNo,
    });
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json({ error: "创建支付订单失败" }, { status: 500 });
  }
}
