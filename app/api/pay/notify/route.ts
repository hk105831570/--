import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyXhCallback } from "@/lib/xunhupay";

export async function POST(req: NextRequest) {
  try {
    // 虎皮椒以 form 表单方式 POST 回调
    const formData = await req.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    console.log("Xunhupay callback received:", JSON.stringify(params));

    const appsecret = process.env.XUNHUPAY_APPSECRET || "";
    if (!appsecret) {
      console.error("XUNHUPAY_APPSECRET not configured");
      return new Response("fail");
    }

    // 验证签名
    if (!verifyXhCallback(params, appsecret)) {
      console.error("Xunhupay callback sign verification failed");
      return new Response("fail");
    }

    const status = params.status;     // OD=已支付
    const tradeOrderId = params.trade_order_id;
    const transactionId = params.transaction_id;

    if (status !== "OD") {
      console.log(`Xunhupay callback: order not paid, status=${status}`);
      return new Response("success"); // 非支付成功通知也返回 success
    }

    if (!tradeOrderId) {
      console.error("Xunhupay callback missing trade_order_id");
      return new Response("fail");
    }

    // 查找订单
    const order = await prisma.order.findUnique({
      where: { outTradeNo: tradeOrderId },
      include: { case: true },
    });

    if (!order) {
      console.error(`Order not found: ${tradeOrderId}`);
      return new Response("success"); // 订单不存在但仍返回 success 避免重复回调
    }

    if (order.status === "paid") {
      // 已处理过，直接返回 success
      return new Response("success");
    }

    // 更新订单状态
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        transactionId,
        payTime: new Date(),
      },
    });

    // 标记案例为已支付
    await prisma.case.update({
      where: { id: order.caseId },
      data: { paymentVerified: true },
    });

    console.log(`Xunhupay payment success: order=${tradeOrderId}, case=${order.caseId}`);

    return new Response("success");
  } catch (error) {
    console.error("Xunhupay callback error:", error);
    return new Response("fail");
  }
}
