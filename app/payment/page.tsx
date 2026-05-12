"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageIcon, CheckCircle2, XCircle, KeyRound, Copy, Check } from "lucide-react";
import { markPaymentVerified, getCaseId } from "@/lib/storage";

const plans = [
  { key: "complete", title: "完整方案版", price: "¥ 9.9" },
  { key: "review", title: "人工复核版", price: "¥ 499" },
];

function QrImage({ src, alt, label, size = 240 }: { src: string; alt: string; label: string; size?: number }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {state === "error" || state === "loading" ? (
        <div className="mx-auto flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50" style={{ width: size, height: size }}>
          {state === "loading" ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">{label}</p>
            </div>
          )}
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`mx-auto rounded-xl ${state !== "loaded" ? "hidden" : ""}`}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
      />
    </>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = searchParams.get("plan");
  const plan = plans.find((p) => p.key === planKey);
  const isReview = planKey === "review";

  // 验证码输入状态
  const [enteredCode, setEnteredCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 已生成的验证码（支付完成后显示）
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  // 支付后获取验证码
  const handleGetCode = async () => {
    const caseId = getCaseId();
    if (!caseId) {
      setErrorMsg("未找到诊断记录，请先完成诊断");
      setVerifyResult("error");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/cases/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const data = await res.json();
      if (data.accessCode) {
        setGeneratedCode(data.accessCode);
        // 自动标记支付
        markPaymentVerified();
      } else {
        setErrorMsg(data.error || "获取失败");
        setVerifyResult("error");
      }
    } catch {
      setErrorMsg("网络错误，请重试");
      setVerifyResult("error");
    } finally {
      setVerifying(false);
    }
  };

  // 验证码输入确认
  const handleVerifyCode = async () => {
    if (!enteredCode.trim()) {
      setErrorMsg("请输入验证码");
      setVerifyResult("error");
      return;
    }

    setVerifying(true);
    setVerifyResult(null);
    setErrorMsg("");

    try {
      const caseId = getCaseId();
      const res = await fetch("/api/cases/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, code: enteredCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
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
          <h1 className="text-xl font-semibold text-gray-800">{isReview ? "联系顾问" : "扫码支付"}</h1>
          <p className="mt-1.5 text-sm text-gray-500">已选择：{plan.title}{isReview ? "" : ` · ${plan.price}`}</p>
        </div>

        {/* 完整方案版 */}
        {!isReview && (
          <div className="mt-6 space-y-6">
            {/* Step 1: 支付 */}
            <div className="rounded-xl border border-gray-200 bg-white px-10 py-10 text-center shadow-sm">
              <div className="mx-auto max-w-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#1a2b4a] text-sm font-bold text-white">1</div>
                <h2 className="mt-3 text-base font-semibold text-gray-800">微信扫码支付</h2>
                <p className="mt-1 text-sm text-gray-400">¥9.9 完整方案版</p>
                <div className="mt-6 flex justify-center">
                  <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                    <QrImage src="/images/wechat-pay.jpg" alt="微信收款码" label="微信收款码" size={240} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: 获取验证码 */}
            <div className="rounded-xl border border-gray-200 bg-white px-10 py-10 text-center shadow-sm">
              <div className="mx-auto max-w-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">2</div>
                <h2 className="mt-3 text-base font-semibold text-gray-800">支付后，获取验证码</h2>
                <p className="mt-1 text-sm text-gray-500">支付成功后点击下方按钮，系统自动生成验证码</p>

                {!generatedCode ? (
                  <button
                    type="button"
                    onClick={handleGetCode}
                    disabled={verifying}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <KeyRound className="h-5 w-5" />
                    {verifying ? "生成中..." : "我已支付，获取验证码"}
                  </button>
                ) : (
                  <div className="mt-5 rounded-lg bg-emerald-50 p-5">
                    <p className="text-sm font-medium text-emerald-800">您的验证码</p>
                    <p className="mt-2 text-3xl font-bold tracking-[0.3em] text-emerald-900">{generatedCode}</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900"
                    >
                      {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {codeCopied ? "已复制" : "复制验证码"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: 输入验证码 */}
            <div className="rounded-xl border border-gray-200 bg-white px-10 py-10 text-center shadow-sm">
              <div className="mx-auto max-w-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</div>
                <h2 className="mt-3 text-base font-semibold text-gray-800">输入验证码，查看报告</h2>
                <p className="mt-1 text-sm text-gray-500">将上方验证码粘贴到此处，解锁完整方案报告</p>

                <div className="mt-5 flex items-center gap-3">
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => {
                      setEnteredCode(e.target.value.toUpperCase());
                      setVerifyResult(null);
                      setErrorMsg("");
                    }}
                    placeholder="输入验证码"
                    maxLength={6}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-gray-900 outline-none focus:border-[#1a2b4a]"
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifying || !enteredCode.trim()}
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
          </div>
        )}

        {/* 人工复核版 */}
        {isReview && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-10 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <p className="text-base font-medium text-amber-900">人工复核版由顾问一对一服务</p>
              <p className="mt-1 text-sm text-amber-700">请添加顾问微信沟通</p>
              <div className="mt-8 flex justify-center">
                <div className="rounded-xl border-2 border-amber-300 bg-white p-4">
                  <QrImage src="/images/wechat-contact.jpg" alt="顾问微信" label="顾问微信二维码" size={260} />
                </div>
              </div>
            </div>
          </div>
        )}
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
