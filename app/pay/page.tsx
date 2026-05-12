"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Shield, Zap, MessageCircle, CheckCircle2 } from "lucide-react";
import FAQItem from "@/components/FAQItem";
import { getDiagnosis } from "@/lib/storage";
import { calculateRisk } from "@/lib/calculateRisk";
import type { DiagnosisSession } from "@/types/risk";

const plans = [
  {
    key: "free",
    title: "免费版",
    price: "已解锁",
    badge: null,
    highlighted: false,
    features: [
      { label: "风险等级评估", ok: true },
      { label: "主要争议点", ok: true },
      { label: "初步处理建议", ok: true },
      { label: "7 天补强行动方案", ok: false },
      { label: "证据缺口清单", ok: false },
      { label: "文书模板清单", ok: false },
      { label: "处理路径对比分析", ok: false },
      { label: "顾问一对一复核", ok: false },
    ],
  },
  {
    key: "complete",
    title: "完整方案版",
    price: "¥ 9.9",
    sub: "限时体验价",
    badge: "推荐",
    highlighted: true,
    features: [
      { label: "风险等级评估", ok: true },
      { label: "主要争议点", ok: true },
      { label: "初步处理建议", ok: true },
      { label: "7 天补强行动方案", ok: true },
      { label: "证据缺口清单", ok: true },
      { label: "文书模板清单", ok: true },
      { label: "处理路径对比分析", ok: true },
      { label: "顾问一对一复核", ok: false },
    ],
  },
  {
    key: "review",
    title: "人工复核版",
    price: null,
    sub: null,
    badge: null,
    highlighted: false,
    features: [
      { label: "风险等级评估", ok: true },
      { label: "主要争议点", ok: true },
      { label: "初步处理建议", ok: true },
      { label: "7 天补强行动方案", ok: true },
      { label: "证据缺口清单", ok: true },
      { label: "文书模板清单", ok: true },
      { label: "处理路径对比分析", ok: true },
      { label: "顾问一对一复核", ok: true },
    ],
  },
];

const faqs = [
  {
    q: "支付后多久能拿到报告？",
    a: "联系顾问微信后，顾问会在工作时间（9:00-22:00）尽快为您处理。完整方案版由 AI 生成后发送，人工复核版由顾问审核后交付。",
  },
  {
    q: "报告是通用模板还是针对我的情况？",
    a: "报告基于您刚才填写的真实情况生成，内容与您的具体场景和答题记录直接对应，不是通用模板。",
  },
  {
    q: "如果我的情况比较特殊，报告能覆盖吗？",
    a: "报告发送后如有疑问或补充，可免费说明一次，顾问会进行针对性补充。",
  },
  {
    q: "人工复核版和完整方案版有什么区别？",
    a: "完整方案版由 AI 基于您的答题生成；人工复核版由顾问在 AI 报告基础上，结合您提供的实际材料（合同、记录等）进行人工审核和补充，适合案情复杂或已收到仲裁通知的情况。",
  },
  {
    q: "我是员工，报告对我适用吗？",
    a: "适用。报告会从员工视角分析您的权益保障情况、可主张的赔偿项目，以及维权路径建议。",
  },
];

export default function PayPage() {
  const router = useRouter();
  const [session, setSession] = useState<DiagnosisSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSession(getDiagnosis());
    setMounted(true);
  }, []);

  const result = useMemo(
    () => (session ? calculateRisk(session.answers, session.userRole) : null),
    [session]
  );

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <p className="text-sm text-gray-500">加载中...</p>
      </main>
    );
  }

  if (!session || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-gray-300" />
          <h1 className="mt-4 text-xl font-semibold text-gray-800">暂无诊断结果</h1>
          <p className="mt-2 text-sm text-gray-500">请先完成一个场景问卷，再查看付费方案。</p>
          <Link
            href="/scenes"
            className="mt-5 inline-flex rounded-md bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white"
          >
            开始诊断
          </Link>
        </div>
      </main>
    );
  }

  const isEmployee = session.userRole === "employee";
  const roleLabel = isEmployee ? "员工方" : "企业方";

  return (
    <main className="min-h-screen bg-[#F7F8FB]">
      {/* top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-4">
          <Link
            href="/result"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            返回诊断结果
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-6 sm:py-10">
        {/* 当前诊断摘要 */}
        <div className="rounded-xl border border-[#fca5a5] bg-[#fef2f2] p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-800">
            {session.sceneTitle}
            <span className="ml-2 text-xs font-normal text-gray-500">· {roleLabel}</span>
          </p>
          <p className="mt-1.5 text-sm">
            风险等级：<span className="font-bold text-[#b91c1c]">{result.levelText}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">主要风险点：{result.disputePoints.length} 项</p>
        </div>

        {/* 套餐对比 */}
        <h2 className="mt-8 text-center text-lg font-semibold text-gray-800">选择适合你的方案</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
                plan.highlighted ? "border-[#1a2b4a] ring-2 ring-[#1a2b4a]" : "border-gray-200"
              }`}
            >
              {plan.badge && (
                <span className="absolute -right-px -top-px rounded-bl-lg rounded-tr-lg bg-[#1a2b4a] px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-semibold text-gray-800">{plan.title}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                {plan.sub && <span className="ml-2 text-xs text-gray-400">{plan.sub}</span>}
              </div>

              <ul className="mt-4 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {f.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 text-center text-gray-300">✗</span>
                    )}
                    <span className={f.ok ? "text-gray-700" : "text-gray-400"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => router.push("/payment?plan=" + plan.key)}
                disabled={plan.key === "free"}
                className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  plan.key === "free"
                    ? "cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400"
                    : plan.highlighted
                    ? "bg-[#1a2b4a] text-white hover:bg-[#0f1f36]"
                    : "border border-[#1a2b4a] text-[#1a2b4a] hover:bg-gray-50"
                }`}
              >
                {plan.key === "free" ? "已查看" : `立即获取${plan.price ? " " + plan.price : ""}`}
              </button>
            </div>
          ))}
        </div>

        {/* 信任说明 */}
        <div className="mt-8 rounded-xl bg-[#f9fafb] p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <Shield className="mx-auto h-6 w-6 text-[#1a2b4a]" />
              <h4 className="mt-2 text-sm font-semibold text-gray-800">信息安全</h4>
              <p className="mt-0.5 text-xs text-gray-500">填写内容仅用于生成本次报告</p>
            </div>
            <div className="text-center">
              <Zap className="mx-auto h-6 w-6 text-[#1a2b4a]" />
              <h4 className="mt-2 text-sm font-semibold text-gray-800">快速交付</h4>
              <p className="mt-0.5 text-xs text-gray-500">完整方案版由 AI 生成，即时交付</p>
            </div>
            <div className="text-center">
              <MessageCircle className="mx-auto h-6 w-6 text-[#1a2b4a]" />
              <h4 className="mt-2 text-sm font-semibold text-gray-800">有疑问可补充</h4>
              <p className="mt-0.5 text-xs text-gray-500">可免费补充说明一次</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="mt-10 text-center text-lg font-semibold text-gray-800">常见问题</h2>
        <div className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>

        {/* footer */}
        <footer className="mt-12 border-t border-gray-200 pt-8 pb-6 text-center">
          <p className="text-xs leading-relaxed text-gray-400">
            本工具生成的报告基于用户填写信息，仅供参考，不构成正式法律意见。
            <br />
            建议结合当地裁判口径及实际材料综合判断，必要时咨询持证律师。
          </p>
        </footer>
      </div>
    </main>
  );
}
