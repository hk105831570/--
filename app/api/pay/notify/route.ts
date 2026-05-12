import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNotify } from "@/lib/wechat-pay";

export async function POST(req: NextRequest) {
  try {
    const xmlText = await req.text();

    const apiKey = process.env.WECHAT_API_KEY || "";
    if (!apiKey) {
      console.error("WECHAT_API_KEY not configured");
      return new Response("FAIL");
    }

    // 验证签名
    const { valid, data } = verifyNotify(xmlText, apiKey);
    if (!valid) {
      console.error("WeChat Pay notify sign verification failed");
      return new Response("FAIL");
    }

    // 检查支付结果
    if (data.return_code !== "SUCCESS" || data.result_code !== "SUCCESS") {
      console.error("WeChat Pay notify payment failed:", data);
      return new Response("SUCCESS"); // 返回 SUCCESS 避免微信重复回调失败记录
    }

    const outTradeNo = data.out_trade_no;
    const transactionId = data.transaction_id;
    const totalFee = data.total_fee ? parseInt(data.total_fee as string) : 0;

    if (!outTradeNo) {
      console.error("WeChat Pay notify missing out_trade_no");
      return new Response("FAIL");
    }

    // 查找订单
    const order = await prisma.order.findUnique({
      where: { outTradeNo },
      include: { case: true },
    });

    if (!order) {
      console.error(`Order not found: ${outTradeNo}`);
      return new Response("SUCCESS"); // 订单不存在，但返回 SUCCESS 避免重复回调
    }

    if (order.status === "paid") {
      // 已处理过，直接返回 SUCCESS
      return new Response("SUCCESS");
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

    console.log(`Payment success: order=${outTradeNo}, case=${order.caseId}, amount=${totalFee}`);

    return new Response("SUCCESS");
  } catch (error) {
    console.error("WeChat Pay notify error:", error);
    return new Response("FAIL");
  }
}
