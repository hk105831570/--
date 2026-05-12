import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";

const WECHAT_API_URL = "https://api.mch.weixin.qq.com/pay/unifiedorder";
const WECHAT_QUERY_URL = "https://api.mch.weixin.qq.com/pay/orderquery";

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: true,
});

/** 生成随机字符串 */
function nonceStr(length = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
}

/** 生成微信支付 V2 MD5 签名 */
export function generateSign(params: Record<string, string | number>, apiKey: string): string {
  const keys = Object.keys(params)
    .filter((k) => k !== "sign" && params[k] !== undefined && params[k] !== "")
    .sort();

  const stringA = keys.map((k) => `${k}=${params[k]}`).join("&");
  const stringSignTemp = `${stringA}&key=${apiKey}`;

  return crypto.createHash("md5").update(stringSignTemp).digest("hex").toUpperCase();
}

/** 将 JS 对象转为微信支付 XML（手动构建，避免依赖 XMLBuilder 版本兼容问题） */
export function buildXml(params: Record<string, string | number | undefined>): string {
  const filtered: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") {
      filtered[k] = v;
    }
  }
  const keys = Object.keys(filtered).sort();
  let xml = "<xml>";
  for (const key of keys) {
    const val = filtered[key];
    xml += `<${key}><![CDATA[${val}]]></${key}>`;
  }
  xml += "</xml>";
  return xml;
}

/** 将微信支付 XML 响应解析为 JS 对象 */
export function parseXml(xml: string): Record<string, string> {
  const result = xmlParser.parse(xml);
  return result?.xml ?? {};
}

/** 验证微信支付回调签名 */
export function verifyNotify(xml: string, apiKey: string): { valid: boolean; data: Record<string, string> } {
  const data = parseXml(xml);
  const sign = data.sign || "";
  const calculated = generateSign(data, apiKey);
  return { valid: sign === calculated, data };
}

/** 统一的微信签名校验（用于验证返回结果签名） */
export function verifySign(params: Record<string, string | number>, sign: string, apiKey: string): boolean {
  return generateSign(params, apiKey) === sign;
}

export interface NativeOrderParams {
  appid: string;
  mch_id: string;
  apiKey: string;
  body: string;
  out_trade_no: string;
  total_fee: number; // 单位：分
  spbill_create_ip: string;
  notify_url: string;
  product_id?: string;
}

export interface NativeOrderResult {
  success: boolean;
  code_url?: string;
  prepay_id?: string;
  errMsg?: string;
}

/** 微信支付统一下单（Native扫码支付） */
export async function createNativeOrder(params: NativeOrderParams): Promise<NativeOrderResult> {
  const { appid, mch_id, apiKey, body, out_trade_no, total_fee, spbill_create_ip, notify_url, product_id } = params;

  const requestParams: Record<string, string | number> = {
    appid,
    mch_id,
    nonce_str: nonceStr(),
    body,
    out_trade_no,
    total_fee,
    spbill_create_ip,
    notify_url,
    trade_type: "NATIVE",
  };

  if (product_id) {
    requestParams.product_id = product_id;
  }

  requestParams.sign = generateSign(requestParams, apiKey);

  const xmlBody = buildXml(requestParams);

  const response = await fetch(WECHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xmlBody,
  });

  const xmlText = await response.text();
  const result = parseXml(xmlText);

  if (result.return_code !== "SUCCESS") {
    return { success: false, errMsg: result.return_msg || "微信支付通信失败" };
  }

  // 验证返回签名
  const returnSign = result.sign || "";
  if (!verifySign(result, returnSign, apiKey)) {
    return { success: false, errMsg: "微信支付返回签名验证失败" };
  }

  if (result.result_code !== "SUCCESS") {
    return { success: false, errMsg: result.err_code_des || result.err_code || "下单失败" };
  }

  return {
    success: true,
    code_url: result.code_url,
    prepay_id: result.prepay_id,
  };
}

export interface QueryOrderParams {
  appid: string;
  mch_id: string;
  apiKey: string;
  out_trade_no: string;
}

export interface QueryOrderResult {
  success: boolean;
  status?: string; // SUCCESS—支付成功 | REFUND—转入退款 | NOTPAY—未支付 | CLOSED—已关闭
  total_fee?: number;
  transaction_id?: string;
  time_end?: string;
  errMsg?: string;
}

/** 查询订单状态 */
export async function queryOrder(params: QueryOrderParams): Promise<QueryOrderResult> {
  const { appid, mch_id, apiKey, out_trade_no } = params;

  const requestParams: Record<string, string | number> = {
    appid,
    mch_id,
    out_trade_no,
    nonce_str: nonceStr(),
  };

  requestParams.sign = generateSign(requestParams, apiKey);

  const xmlBody = buildXml(requestParams);

  const response = await fetch(WECHAT_QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xmlBody,
  });

  const xmlText = await response.text();
  const result = parseXml(xmlText);

  if (result.return_code !== "SUCCESS") {
    return { success: false, errMsg: result.return_msg || "查询失败" };
  }

  // 验证签名
  const returnSign = result.sign || "";
  if (!verifySign(result, returnSign, apiKey)) {
    return { success: false, errMsg: "签名验证失败" };
  }

  if (result.result_code !== "SUCCESS") {
    return { success: false, errMsg: result.err_code_des || "查询失败" };
  }

  return {
    success: true,
    status: result.trade_state,
    total_fee: result.total_fee ? parseInt(result.total_fee as string) : undefined,
    transaction_id: result.transaction_id,
    time_end: result.time_end,
  };
}
