"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Loader2, RefreshCw, Copy, Check, FileDown } from "lucide-react";
import { getBasicInfo, getDiagnosis } from "@/lib/storage";
import { calculateRisk } from "@/lib/calculateRisk";
import type { BasicInfo, DiagnosisSession } from "@/types/risk";

interface CasesRequest {
  city: string;
  industry: string;
  companySize: string;
  workYears: number;
  sceneName: string;
  userAnswers: string;
  riskLevel: string;
  riskPoints: string[];
}

function formatUserAnswers(session: DiagnosisSession): string {
  return session.answers
    .map((a, idx) => `${idx + 1}. ${a.questionText}\n   回答：${a.selected.label}`)
    .join("\n\n");
}

function calculateWorkYears(entryDate?: string): number {
  if (!entryDate) return 0;
  const entry = new Date(entryDate);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24 * 365)));
}

function SkeletonLoader() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-2/3 rounded bg-slate-200 animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
      <div className="h-4 w-1/3 rounded bg-slate-200 animate-pulse" />
      <div className="my-8 h-px bg-slate-200" />
      <div className="h-6 w-1/2 rounded bg-slate-200 animate-pulse" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-4/6 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export default function CasesPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [session, setSession] = useState<DiagnosisSession | null>(null);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setContent("");

    const info = getBasicInfo();
    const diag = getDiagnosis();

    if (!diag) {
      setError("暂无诊断数据，请先完成风险诊断。");
      setLoading(false);
      return;
    }

    setBasicInfo(info);
    setSession(diag);

    const result = calculateRisk(diag.answers, diag.userRole);

    const requestBody: CasesRequest = {
      city: info?.city || "",
      industry: info?.industry || "",
      companySize: info?.companySize || "",
      workYears: calculateWorkYears(info?.entryDate),
      sceneName: diag.sceneTitle,
      userAnswers: formatUserAnswers(diag),
      riskLevel: result.levelText,
      riskPoints: result.disputePoints
    };

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成报告时发生未知错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session && !loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5">
        <div className="rounded-lg border border-line bg-white p-8 text-center shadow-panel">
          <h1 className="text-xl font-semibold text-ink">暂无诊断数据</h1>
          <p className="mt-2 text-sm text-muted">请先完成一个场景问卷，再查看相似案例。</p>
          <Link href="/scenes" className="mt-5 inline-flex rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white">
            开始诊断
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/result" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            返回诊断结果
          </Link>
          {!loading && content && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-slate-50"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "已复制" : "复制全文"}
              </button>
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-400 opacity-60 cursor-not-allowed"
              >
                <FileDown className="h-4 w-4" />
                下载 PDF
              </button>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-6 shadow-panel">
          <div className="mb-6 border-b border-line pb-4">
            <h1 className="text-2xl font-semibold text-ink">相似案例与解决方案</h1>
            <p className="mt-2 text-sm text-muted">
              基于您填写的纠纷情况，智能匹配相似案例并生成参考建议。
            </p>
          </div>

          {loading ? (
            <div className="py-8">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在生成案例报告…
              </div>
              <div className="mt-6">
                <SkeletonLoader />
              </div>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-danger">{error}</p>
              <button
                onClick={generateReport}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white"
              >
                <RefreshCw className="h-4 w-4" />
                重新生成
              </button>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => <h1 className="text-xl font-bold text-ink mb-4" {...props} />,
                  h2: ({ ...props }) => <h2 className="text-lg font-semibold text-ink mt-8 mb-4" {...props} />,
                  h3: ({ ...props }) => <h3 className="text-base font-semibold text-ink mt-6 mb-3" {...props} />,
                  p: ({ ...props }) => <p className="text-sm leading-6 text-muted mb-3" {...props} />,
                  ul: ({ ...props }) => <ul className="list-disc pl-5 space-y-2 text-sm text-muted mb-3" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal pl-5 space-y-2 text-sm text-muted mb-3" {...props} />,
                  li: ({ ...props }) => <li className="leading-6" {...props} />,
                  table: ({ ...props }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="min-w-full border-collapse text-sm" {...props} />
                    </div>
                  ),
                  thead: ({ ...props }) => <thead className="bg-slate-50" {...props} />,
                  th: ({ ...props }) => (
                    <th className="border border-line px-3 py-2 text-left font-semibold text-ink" {...props} />
                  ),
                  td: ({ ...props }) => <td className="border border-line px-3 py-2 text-muted" {...props} />,
                  blockquote: ({ ...props }) => (
                    <blockquote className="border-l-4 border-amber-300 bg-amber-50 pl-4 py-2 my-4 text-sm text-amber-900" {...props} />
                  ),
                  hr: ({ ...props }) => <hr className="my-6 border-slate-200" {...props} />
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!loading && !error && content && (
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/result" className="inline-flex items-center justify-center rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink">
              返回诊断结果
            </Link>
            <button
              onClick={generateReport}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              重新生成
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
