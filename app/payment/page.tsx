"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, KeyRound, MessageSquare, Loader2, QrCode } from "lucide-react";
import { markPaymentVerified, getCaseId, getAccessToken, saveCaseId, saveAccessToken } from "@/lib/storage";
import { calculateRisk } from "@/lib/calculateRisk";

// 支付轮询间隔（毫秒）
const POLL_INTERVAL = 3000;

const plans = [
  { key: "complete", title: "完整方案版", price: "¥9.9" },
  { key: "review", title: "人工复核版", price: "¥499" },
];

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = searchParams.get("plan");
  const plan = plans.find((p) => p.key === planKey);
  const isReview = planKey === "review";
  const isComplete = planKey === "complete";

  // 支付状态
  const [paymentStep, setPaymentStep] = useState<"create" | "qr" | "paid" | "code">("create");
  const [qrcode, setQrcode] = useState("");
  const [outTradeNo, setOutTradeNo] = useState("");
  const [totalFee, setTotalFee] = useState(0);
  const [payError, setPayError] = useState("");
  const [creating, setCreating] = useState(false);

  // 验证码
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  /** 创建支付订单 */
  const createPayment = useCallback(async () => {
    let caseId = getCaseId();
    
    // 如果 caseId 不存在，尝试先保存诊断记录
    if (!caseId) {
      const session = localStorage.getItem("labor-risk-diagnosis-session");
      const basicInfo = localStorage.getItem("labor-risk-basic-info");
      if (!session) {
        setPayError("未找到诊断记录，请先完成诊断");
        return;
      }
      
      try {
        const accessToken = getAccessToken();
        const sessionObj = JSON.parse(session);
        // 从 session 重新计算风险结果
        const riskResult = calculateRisk(sessionObj.answers, sessionObj.userRole);
        const saveRes = await fetch("/api/cases/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            basicInfo: basicInfo ? JSON.parse(basicInfo) : null,
            session: sessionObj,
            riskResult,
          }),
        });
        const saveData = await saveRes.json();
        if (saveData.caseId) {
          saveCaseId(saveData.caseId);
          if (saveData.accessToken) saveAccessToken(saveData.accessToken);
          caseId = saveData.caseId;
        } else {
          setPayError("创建诊断记录失败，请重新完成诊断");
          return;
        }
      } catch {
        setPayError("网络错误，请重试");
        return;
      }
    }

    setCreating(true);
    setPayError("");

    try {
      const accessToken = getAccessToken();
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": accessToken || "",
        },
        body: JSON.stringify({ caseId, plan: planKey }),
      });
      const data = await res.json();

      if (data.success && data.qrcode) {
        setQrcode(data.qrcode);
        setOutTradeNo(data.out_trade_no);
        setTotalFee(data.total_fee);
        setPaymentStep("qr");
      } else if (data.success && data.message === "已完成支付") {
        setPaymentStep("paid");
      } else {
        setPayError(data.error || "创建订单失败");
      }
    } catch {
      setPayError("网络错误，请重试");
    } finally {
      setCreating(false);
    }
  }, [planKey]);

  /** 轮询支付状态 */
  useEffect(() => {
    if (paymentStep !== "qr" || !outTradeNo) return;

    const caseId = getCaseId();
    if (!caseId) return;

    const timer = setInterval(async () => {
      try {
        const accessToken = getAccessToken();
        const res = await fetch(`/api/pay/query?caseId=${caseId}`, {
          headers: { "x-access-token": accessToken || "" },
        });
        const data = await res.json();

        if (data.paymentVerified || data.order?.status === "paid") {
          setPaymentStep("paid");
          clearInterval(timer);
        }
      } catch {
        // 忽略轮询错误
      }
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [paymentStep, outTradeNo]);

  // 如果从外部已支付，直接跳转到完整报告
  useEffect(() => {
    if (paymentStep === "paid" && !isReview) {
      markPaymentVerified();
      const t = setTimeout(() => router.push("/complete-report"), 1500);
      return () => clearTimeout(t);
    }
  }, [paymentStep, isReview, router]);

  // 初始自动创建订单（完整方案版）
  useEffect(() => {
    if (isComplete && paymentStep === "create") {
      createPayment();
    }
  }, [isComplete, paymentStep, createPayment]);

  const handleVerifyCode = async () => {
    const caseId = getCaseId();
    if (!caseId) {
      setErrorMsg("未找到诊断记录");
      setVerifyResult("error");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("请输入验证码");
      setVerifyResult("error");
      return;
    }

    setVerifying(true);
    setVerifyResult(null);
    setErrorMsg("");

    try {
      const accessToken = getAccessToken();
      const res = await fetch("/api/cases/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": accessToken || "",
        },
        body: JSON.stringify({ caseId, code: code.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        markPaymentVerified();
        setVerifyResult("success");
        setTimeout(() => {
          router.push("/complete-report");
        }, 1000);
      } else {
        setErrorMsg(data.error || "验证失败");
        setVerifyResult("error");
      }
    } catch {
      setErrorMsg("网络错误，请重试");
      setVerifyResult("error");
    } finally {
      setVerifying(false);
    }
  };

  if (!plan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800">方案未选择</h1>
          <p className="mt-2 text-sm text-gray-500">请先选择一个付费方案。</p>
          <Link href="/pay" className="mt-5 inline-flex rounded-md bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white">返回方案选择</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-5 py-4">
          <Link href="/pay" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4" />返回方案选择
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        {/* 标题 */}
        <div className="rounded-xl border border-gray-200 bg-white px-10 py-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">获取完整方案报告</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            已选择：{plan.title}{plan.price ? ` · ${plan.price}` : ""}
          </p>
        </div>

        {/* 人工复核版：显示客服微信 */}
        {isReview && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-10 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <MessageSquare className="mx-auto h-10 w-10 text-amber-600" />
              <p className="mt-4 text-base font-medium text-amber-900">人工复核版由顾问一对一服务</p>
              <p className="mt-2 text-sm text-amber-700">请添加顾问微信，完成支付后获取验证码</p>
              <img
                src="/images/wechat-contact.jpg"
                alt="顾问微信二维码"
                className="mx-auto mt-6 rounded-xl border border-amber-200 shadow-sm"
                width={200}
                height={200}
              />
              <p className="mt-2 text-xs text-amber-600">扫码添加顾问微信</p>
            </div>
          </div>
        )}

        {/* 完整方案版：扫码支付 */}
        {isComplete && paymentStep === "create" && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-10 py-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1a2b4a]" />
            <p className="mt-4 text-sm text-gray-500">正在创建支付订单...</p>
          </div>
        )}

        {isComplete && paymentStep === "qr" && qrcode && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-10 py-12 text-center shadow-sm">
            <QrCode className="mx-auto h-10 w-10 text-[#1a2b4a]" />
            <h2 className="mt-4 text-base font-semibold text-gray-800">
              请使用微信 / 支付宝扫码支付
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              应付金额：<span className="font-bold text-[#1a2b4a]">¥{totalFee}</span>
            </p>

            <div className="mx-auto mt-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrcode}
                alt="支付二维码"
                className="rounded-xl border border-gray-200 shadow-sm"
                width={240}
                height={240}
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              等待支付完成...
            </div>

            <p className="mt-2 text-xs text-gray-400">二维码有效期 5 分钟，请尽快支付</p>

            {payError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{payError}</div>
            )}

            <button
              type="button"
              onClick={createPayment}
              className="mt-4 text-sm text-[#1a2b4a] underline hover:text-[#0f1f36]"
            >
              重新生成二维码
            </button>
          </div>
        )}

        {isComplete && paymentStep === "paid" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-10 py-12 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-lg font-semibold text-emerald-800">支付成功！</h2>
            <p className="mt-2 text-sm text-emerald-600">正在跳转报告页面...</p>
          </div>
        )}

        {/* 失败/错误 */}
        {isComplete && payError && paymentStep !== "qr" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-10 py-12 text-center shadow-sm">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
            <p className="mt-2 text-sm text-red-700">{payError}</p>
            <button
              type="button"
              onClick={createPayment}
              className="mt-4 rounded-lg bg-[#1a2b4a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1f36]"
            >
              重新支付
            </button>
          </div>
        )}

        {/* 验证码输入（仅完整方案版支付后显示） */}
        {isComplete && paymentStep === "paid" && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-10 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <KeyRound className="mx-auto h-10 w-10 text-[#1a2b4a]" />
              <h2 className="mt-4 text-base font-semibold text-gray-800">输入验证码，解锁完整报告</h2>
              <p className="mt-2 text-sm text-gray-500">
                联系客服完成支付后，您将获得 6 位验证码
              </p>

              <div className="mt-8 flex items-center gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setVerifyResult(null);
                    setErrorMsg("");
                  }}
                  placeholder="输入6位验证码"
                  maxLength={6}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-gray-900 outline-none focus:border-[#1a2b4a]"
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifying || !code.trim()}
                  className="rounded-lg bg-[#1a2b4a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f1f36] disabled:opacity-50"
                >
                  {verifying ? "..." : "验证"}
                </button>
              </div>

              {verifyResult === "success" && (
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="mr-1.5 inline h-4 w-4" />验证成功！正在跳转报告...
                </div>
              )}
              {verifyResult === "error" && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                  <XCircle className="mr-1.5 inline h-4 w-4" />{errorMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {creating && paymentStep !== "qr" && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />正在创建订单...
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          本报告基于您填写的信息生成，仅供参考，不构成正式法律意见。
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <p className="text-sm text-gray-500">加载中...</p>
      </main>
    }>
      <PaymentContent />
    </Suspense>
  );
}
