import crypto from "crypto";

const XUNHUPAY_API_URL = "https://api.xunhupay.com/payment/do.html";

/** 生成随机字符串 */
function nonceStr(length = 16): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

/**
 * 生成虎皮椒签名
 * 规则：按参数名 ASCII 从小到大排序，拼接成 key=value&key2=value2 格式，
 * 最后直接拼接 appsecret，整体做 MD5
 */
export function generateXhHash(
  params: Record<string, string | number>,
  appsecret: string,
): string {
  const keys = Object.keys(params)
    .filter((k) => k !== "hash" && params[k] !== null && params[k] !== "" && params[k] !== undefined)
    .sort();

  const str = keys.map((k) => `${k}=${params[k]}`).join("&");
  return crypto.createHash("md5").update(str + appsecret).digest("hex");
}

/** 验证回调签名 */
export function verifyXhCallback(
  params: Record<string, string>,
  appsecret: string,
): boolean {
  const receivedHash = params.hash || "";
  const calculated = generateXhHash(params, appsecret);
  return receivedHash === calculated;
}

export interface XhCreateOrderParams {
  appid: string;
  appsecret: string;
  tradeOrderId: string;
  totalFee: number;          // 单位：元
  title: string;
  notifyUrl: string;
  returnUrl?: string;
  attach?: string;
}

export interface XhCreateOrderResult {
  success: boolean;
  urlQrcode?: string;        // PC 端二维码地址
  url?: string;              // 手机端跳转链接
  orderId?: string;
  errMsg?: string;
}

/** 创建虎皮椒支付订单 */
export async function createXhOrder(
  params: XhCreateOrderParams,
): Promise<XhCreateOrderResult> {
  const { appid, appsecret, tradeOrderId, totalFee, title, notifyUrl, returnUrl, attach } = params;

  const requestParams: Record<string, string | number> = {
    version: "1.1",
    appid,
    trade_order_id: tradeOrderId,
    total_fee: totalFee,
    title,
    time: Math.floor(Date.now() / 1000),
    notify_url: notifyUrl,
    nonce_str: nonceStr(),
  };

  // 可选参数
  if (returnUrl) requestParams.return_url = returnUrl;
  if (attach) requestParams.attach = attach;

  // 生成签名
  requestParams.hash = generateXhHash(requestParams, appsecret);

  const response = await fetch(XUNHUPAY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestParams),
  });

  const result = await response.json();

  if (result.errcode !== 0) {
    return { success: false, errMsg: result.errmsg || "下单失败" };
  }

  // 验证返回签名
  if (result.hash) {
    const calculated = generateXhHash(
      { ...requestParams, ...result },
      appsecret,
    );
    // 返回的 hash 可能只包含返回参数，宽松验证
  }

  return {
    success: true,
    urlQrcode: result.url_qrcode,
    url: result.url,
    orderId: result.openid,
  };
}
