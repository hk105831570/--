"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import {
  FileText,
  AlertTriangle,
  Search,
  Clock,
  MessageSquare,
  FileCheck,
  GitBranch,
  BookOpen,
  Scale,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Copy,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import CTASection from "@/components/CTASection";
import Disclaimer from "@/components/Disclaimer";
import { calculateRisk } from "@/lib/calculateRisk";
import { getDiagnosis, getBasicInfo, getCaseId, isPaymentVerified, markPaymentVerified } from "@/lib/storage";
import type { DiagnosisSession, BasicInfo, ReportData } from "@/types/risk";

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

function getRiskColor(level: string) {
  switch (level.toLowerCase()) {
    case "高风险":
    case "critical":
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "中风险":
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "低风险":
    case "low":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "missing":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "partial":
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case "complete":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-slate-500" />;
  }
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-3/4 bg-slate-200 rounded" />
      <div className="h-4 w-1/2 bg-slate-200 rounded" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg border border-slate-200" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-48 bg-slate-100 rounded-lg border border-slate-200" />
      ))}
    </div>
  );
}

export default function CompleteReportPage() {
  const router = useRouter();
  const [session, setSession] = useState<DiagnosisSession | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 支付校验：未支付跳转回方案页（dev=1 跳过，用于开发者测试）
    if (typeof window !== "undefined" && !isPaymentVerified()) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "1") {
        markPaymentVerified();
      } else {
        router.replace("/pay");
        return;
      }
    }
    setSession(getDiagnosis());
    setBasicInfo(getBasicInfo());
  }, [router]);

  const result = useMemo(() => (session ? calculateRisk(session.answers, session.userRole) : null), [session]);

  const generateReport = useCallback(async () => {
    if (!session || !result) return;

    setLoading(true);
    setError(null);

    try {
      const caseId = getCaseId();

      const requestBody = {
        city: basicInfo?.city || "",
        industry: basicInfo?.industry || "",
        companySize: basicInfo?.companySize || "",
        workYears: calculateWorkYears(basicInfo?.entryDate),
        sceneName: session.sceneTitle,
        userAnswers: formatUserAnswers(session),
        riskLevel: result.levelText,
        riskPoints: result.disputePoints,
        userRole: session.userRole || "employer",
        caseId: caseId || undefined
      };

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成报告时出错");
    } finally {
      setLoading(false);
    }
  }, [session, result, basicInfo]);

  useEffect(() => {
    if (session && result && !report) {
      generateReport();
    }
  }, [session, result, report, generateReport]);

  const handleCopy = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!reportRef.current || !session) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc"
      });
      const link = document.createElement("a");
      const reportTitle = session.userRole === "employee" ? "员工权益维权方案书" : "劳动纠纷处理建议书";
      link.download = `${reportTitle}-${report?.reportNumber || Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("下载失败:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!session || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">暂无诊断结果</h1>
          <p className="mt-2 text-sm text-slate-600">请先完成一个场景问卷，再查看结果。</p>
          <Link href="/scenes" className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            开始诊断当前纠纷
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/result" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4" />
                返回基础诊断
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-900" />
                <span className="text-sm font-semibold text-slate-900">{session.userRole === "employee" ? "员工权益维权方案书" : "劳动纠纷处理建议书"}</span>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  PRO
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {report && (
                <>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "已复制" : "复制"}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {downloading ? "下载中..." : "下载截图"}
                  </button>
                </>
              )}
              <button
                onClick={generateReport}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                重新生成
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {loading && !report && (
          <div className="py-12">
            <div className="flex items-center gap-3 text-sm text-slate-600 mb-8">
              <RefreshCw className="w-5 h-5 animate-spin" />
              正在生成{session.userRole === "employee" ? "《员工权益维权方案书》" : "《劳动纠纷处理建议书》"}...
            </div>
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-red-800 mb-4">{error}</p>
            <button
              onClick={generateReport}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              重试
            </button>
          </div>
        )}

        {report && (
          <div ref={reportRef} className="space-y-8">
            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white mb-4">
                    <FileText className="w-4 h-4" />
                    {report.reportNumber}
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{report.reportTitle}</h1>
                  <p className="mt-3 text-lg text-slate-600">{report.sceneType}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">生成日期</div>
                  <div className="text-lg font-semibold text-slate-900">{report.reportDate}</div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border {getRiskColor(report.riskLevel)}">
                    <AlertTriangle className="w-4 h-4" />
                    {report.riskLevel}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-red-50 p-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">争议风险分析</h2>
                  <p className="text-sm text-slate-600">Dispute Risk Analysis</p>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-6 mb-6">
                <p className="text-slate-800 leading-relaxed">{report.disputeRiskAnalysis.summary}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {report.disputeRiskAnalysis.keyRisks.map((risk, idx) => (
                  <div key={idx} className={`rounded-lg border p-5 ${getRiskColor(risk.level)}`}>
                    <h3 className="font-semibold text-slate-900 mb-2">{risk.title}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{risk.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-amber-50 p-2">
                  <Search className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">证据缺口清单</h2>
                  <p className="text-sm text-slate-600">Evidence Gap Checklist</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">证据项目</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">重要性说明</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.evidenceGaps.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                            <span className="text-sm font-medium text-slate-900">{item.item}</span>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.importance}</td>
                        <td className="px-6 py-4 text-center">{getStatusIcon(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">7 天补强动作</h2>
                  <p className="text-sm text-slate-600">7-Day Action Plan</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-6">
                  {report.sevenDayActions.map((day, idx) => (
                    <div key={idx} className="relative flex gap-6">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold shadow-lg">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">{day.day}</h3>
                        <ul className="space-y-2">
                          {day.actions.map((action, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-3">
                              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700 leading-relaxed">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-blue-50 p-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">沟通注意事项</h2>
                  <p className="text-sm text-slate-600">Communication Guidelines</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {report.communicationNotes.map((note, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">{note.audience}</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          应说明
                        </h4>
                        <ul className="space-y-1">
                          {note.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="text-sm text-slate-700 pl-5 relative">
                              <span className="absolute left-0 text-emerald-500">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          应避免
                        </h4>
                        <ul className="space-y-1">
                          {note.avoid.map((point, pIdx) => (
                            <li key={pIdx} className="text-sm text-slate-700 pl-5 relative">
                              <span className="absolute left-0 text-red-500">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-purple-50 p-2">
                  <FileCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">常用文书模板清单</h2>
                  <p className="text-sm text-slate-600">Document Templates</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {report.documentTemplates.map((doc, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                      <button disabled className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
                        准备中
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{doc.purpose}</p>
                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">关键条款：</span>
                      {doc.keyClauses.join("、")}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-slate-900 p-2">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">处理路径建议</h2>
                  <p className="text-sm text-slate-600">Handling Path Recommendations</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3 mb-8">
                {report.handlingPath.options.map((option, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">{option.path}</h3>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {option.successRate}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{option.description}</p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-700 mb-1">优势</h4>
                        <ul className="space-y-1">
                          {option.pros.map((pro, pIdx) => (
                            <li key={pIdx} className="text-xs text-slate-600 flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-red-700 mb-1">劣势</h4>
                        <ul className="space-y-1">
                          {option.cons.map((con, cIdx) => (
                            <li key={cIdx} className="text-xs text-slate-600 flex items-start gap-1">
                              <XCircle className="w-3 h-3 text-red-500 mt-0.5" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-slate-900 text-white p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  推荐方案
                </h3>
                <p className="text-slate-300 leading-relaxed">{report.handlingPath.recommendation}</p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-cyan-50 p-2">
                  <BookOpen className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">相似案例参考</h2>
                  <p className="text-sm text-slate-600">Similar Cases Reference</p>
                </div>
              </div>
              <div className="space-y-6">
                {report.similarCases.map((caseItem, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">{caseItem.title}</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">情形</h4>
                        <p className="text-sm text-slate-700">{caseItem.situation}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">处理结果</h4>
                        <p className="text-sm text-slate-700">{caseItem.result}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">关键依据</h4>
                        <p className="text-sm text-slate-700">{caseItem.basis}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">参考价值</h4>
                        <p className="text-sm text-slate-700">{caseItem.reference}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-slate-100 p-2">
                  <Scale className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">法律依据引用</h2>
                  <p className="text-sm text-slate-600">Legal Basis</p>
                </div>
              </div>
              <div className="space-y-4">
                {report.legalBasis.map((law, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-bold text-slate-900">{law.law}</span>
                      <span className="text-sm font-semibold text-slate-600">{law.article}</span>
                    </div>
                    <p className="text-sm text-slate-700">{law.content}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-bold text-amber-900 mb-2">免责声明</h2>
                  <p className="text-amber-800 leading-relaxed">{report.disclaimer}</p>
                </div>
              </div>
            </section>

            <footer className="mt-8"><Disclaimer /></footer>
          </div>
        )}
      </div>
    </main>
  );
}
