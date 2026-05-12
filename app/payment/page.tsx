"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";

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
  const planKey = searchParams.get("plan");
  const plan = plans.find((p) => p.key === planKey);
  const isReview = planKey === "review";

  if (!plan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800">方案未选择</h1>
          <p className="mt-2 text-sm text-gray-500">请先选择一个付费方案。</p>
          <Link
            href="/pay"
            className="mt-5 inline-flex rounded-md bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white"
          >
            返回方案选择
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB]">
      {/* top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-5 py-4">
          <Link
            href="/pay"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            返回方案选择
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        {/* 方案摘要 — 更宽的内边距 */}
        <div className="rounded-xl border border-gray-200 bg-white px-10 py-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">{isReview ? "联系顾问" : "扫码支付"}</h1>
          <p className="mt-1.5 text-sm text-gray-500">已选择：{plan.title}{isReview ? "" : ` · ${plan.price}`}</p>
        </div>

        {isReview ? (
          /* 人工复核版 — 全宽展示 */
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-10 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <p className="text-base font-medium text-amber-900">
                人工复核版由顾问一对一服务
              </p>
              <p className="mt-1 text-sm text-amber-700">请添加顾问微信沟通</p>
              <div className="mt-8 flex justify-center">
                <div className="rounded-xl border-2 border-amber-300 bg-white p-4">
                  <QrImage src="/images/wechat-contact.jpg" alt="顾问微信" label="顾问微信二维码" size={260} />
                </div>
              </div>
              <p className="mt-6 text-sm text-amber-700">
                添加时请备注「劳动纠纷复核」
              </p>
              <div className="mt-8 rounded-lg border border-amber-300 bg-white/60 px-5 py-4 text-left text-sm text-amber-800">
                <p className="font-medium">温馨提示：</p>
                <p className="mt-1 text-amber-700">添加后请将您的诊断结果截图发送给顾问，顾问将在了解您的具体情况后提供人工复核服务。</p>
              </div>
            </div>
          </div>
        ) : (
          /* 完整方案版 — 全宽展示 */
          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-10 py-12 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <h2 className="text-base font-semibold text-gray-700">请使用微信扫码支付</h2>
              <p className="mt-1 text-sm text-gray-400">¥9.9 完整方案版</p>
              <div className="mt-8 flex justify-center">
                <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                  <QrImage src="/images/wechat-pay.jpg" alt="微信收款码" label="微信收款码" size={260} />
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
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
          <p className="text-sm text-gray-500">加载中...</p>
        </main>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
