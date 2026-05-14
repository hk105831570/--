"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case_id");
  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!caseId) {
      setStatus("error");
      setMessage("缺少订单信息");
      return;
    }

    fetch("/api/pay/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("支付确认成功！");
        } else {
          setStatus("error");
          setMessage(data.error || "确认失败");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("网络错误");
      });
  }, [caseId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === "confirming" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#1a2b4a]" />
            <h1 className="mt-4 text-lg font-semibold text-gray-800">正在确认支付...</h1>
            <p className="mt-2 text-sm text-gray-500">请勿关闭此页面</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-lg font-semibold text-emerald-800">支付成功！</h1>
            <p className="mt-2 text-sm text-emerald-600">订单已确认</p>

            <div className="mt-6 rounded-lg bg-amber-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">请回到电脑浏览器</p>
                  <p className="mt-1">页面将自动跳转到报告页，无需任何操作。</p>
                </div>
              </div>
            </div>

            <Link
              href="/complete-report"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f1f36]"
            >
              查看完整报告
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-lg font-semibold text-red-800">确认失败</h1>
            <p className="mt-2 text-sm text-red-600">{message}</p>
            <Link
              href="/complete-report"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f1f36]"
            >
              尝试查看报告
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaySuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <p className="text-sm text-gray-500">加载中...</p>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
