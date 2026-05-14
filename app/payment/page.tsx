"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, QrCode } from "lucide-react";
import { getCaseId, saveCaseId, saveAccessToken } from "@/lib/storage";

// 支付轮询间隔（毫秒）
const POLL_INTERVAL = 3000;

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = searchParams.get("plan");
  const isComplete = planKey === "complete";

  const [step, setStep] = useState<"init" | "loading" | "qrcode" | "paid" | "error">("init");
  const [qrcode, setQrcode] = useState("");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState("");
  const [totalFee, setTotalFee] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  /** 一键创建订单+支付 */
  const createOrder = useCallback(async () => {
    setStep("loading");
    setErrorMsg("");

    // 先从 localStorage 取诊断数据
    const sessionRaw = localStorage.getItem("labor-risk-diagnosis-session");
    const basicInfoRaw = localStorage.getItem("labor-risk-basic-info");

    if (!sessionRaw) {
      setErrorMsg("未找到诊断数据，请先完成诊断");
      setStep("error");
      return;
    }

    try {
      const session = JSON.parse(sessionRaw);
      const basicInfo = basicInfoRaw ? JSON.parse(basicInfoRaw) : null;

      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo,
          session,
          plan: planKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "创建订单失败");
        setStep("error");
        return;
      }

      // 保存 caseId 和 accessToken 到本地
      if (data.caseId) {
        saveCaseId(data.caseId);
        setCaseId(data.caseId);
      }
      if (data.accessToken) {
        saveAccessToken(data.accessToken);
      }

      if (data.qrcode) {
        setQrcode(data.qrcode);
        setOutTradeNo(data.out_trade_no);
        setTotalFee(data.total_fee);
        setStep("qrcode");
      }
    } catch {
      setErrorMsg("网络错误，请重试");
      setStep("error");
    }
  }, [planKey]);

  // 自动创建订单
  useEffect(() => {
    if (isComplete && step === "init") {
      createOrder();
    }
  }, [isComplete, step, createOrder]);

  /** 轮询支付状态 */
  useEffect(() => {
    if (step !== "qrcode" || !caseId) return;

    const timer = setInterval(async () => {
      try {
        const accessToken = localStorage.getItem("labor-...oken");
        const res = await fetch(`/api/pay/query?caseId=${caseId}`, {
          headers: { "x-access-token": accessToken || "" },
        });
        const data = await res.json();

        if (data.paymentVerified || data.order?.status === "paid") {
          setStep("paid");
          localStorage.setItem("labor-risk-payment-verified", "true");
          clearInterval(timer);
          setTimeout(() => router.push("/complete-report"), 1500);
        }
      } catch {
        // 忽略轮询错误
      }
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [step, caseId, router]);

  if (!isComplete) {
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
            已选择：完整方案版 · ¥9.9
          </p>
        </div>

        {/* 加载中 */}
        {step === "loading" && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-10 py-20 text-center shadow-sm">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1a2b4a]" />
            <p className="mt-4 text-sm text-gray-500">正在创建支付订单...</p>
          </div>
        )}

        {/* 二维码 */}
        {step === "qrcode" && qrcode && (
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
            <p className="mt-2 text-xs text-gray-400">二维码有效期 5 分钟</p>

            <p className="mt-6 text-sm text-gray-500">支付成功后手机将自动跳转，请稍候...</p>

            <button
              type="button"
              onClick={createOrder}
              className="mt-4 text-sm text-[#1a2b4a] underline hover:text-[#0f1f36]"
            >
              重新生成二维码
            </button>
          </div>
        )}

        {/* 支付成功 */}
        {step === "paid" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-10 py-20 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-lg font-semibold text-emerald-800">支付成功！</h2>
            <p className="mt-2 text-sm text-emerald-600">正在跳转报告页面...</p>
          </div>
        )}

        {/* 错误 */}
        {step === "error" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-10 py-12 text-center shadow-sm">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
            <p className="mt-3 text-sm text-red-700">{errorMsg}</p>
            <button
              type="button"
              onClick={createOrder}
              className="mt-6 rounded-lg bg-[#1a2b4a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1f36]"
            >
              重新支付
            </button>
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
