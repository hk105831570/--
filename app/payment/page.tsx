"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, KeyRound, Copy, Check, MessageSquare } from "lucide-react";
import { markPaymentVerified, getCaseId } from "@/lib/storage";

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

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerifyCode = async () => {
    const caseId = getCaseId();
    if (!caseId) {
      setErrorMsg("未找到诊断记录，请先完成诊断");
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
      const res = await fetch("/api/cases/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        <div className="rounded-xl border border-gray-200 bg-white px-10 py-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">获取完整方案报告</h1>
          <p className="mt-1.5 text-sm text-gray-500">已选择：{plan.title}{plan.price ? ` · ${plan.price}` : ""}</p>
        </div>

        {isReview ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-10 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <MessageSquare className="mx-auto h-10 w-10 text-amber-600" />
              <p className="mt-4 text-base font-medium text-amber-900">人工复核版由顾问一对一服务</p>
              <p className="mt-2 text-sm text-amber-700">付款后联系顾问获取验证码，输入后解锁报告</p>
            </div>
          </div>
        ) : (
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
