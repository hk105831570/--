"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  Scale,
  BookOpen,
  Search,
  Clock,
  MessageSquare,
  FileCheck,
  GitBranch,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  BasicInfo,
  DiagnosisAnswer,
  RiskResult,
  ReportData,
} from "@/types/risk";

const RISK_STYLES: Record<string, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-700",
  critical: "border-red-300 bg-red-100 text-red-900",
};

const RISK_LABELS: Record<string, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  critical: "极高风险",
};

function getStatusIcon(status: string) {
  switch (status) {
    case "missing":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "partial":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case "complete":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-500" />;
  }
}

function getRiskColor(level: string) {
  switch (level) {
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

interface CaseDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  userRole: string;
  sceneId: string;
  sceneTitle: string;
  basicInfo: BasicInfo | null;
  answers: DiagnosisAnswer[];
  riskLevel: string;
  riskScore: number;
  riskResult: RiskResult | null;
  reportData: ReportData | null;
  reportNumber: string | null;
}

function BasicInfoCard({ info, role }: { info: BasicInfo | null; role: string }) {
  if (!info) return <p className="text-sm text-slate-500">未填写基础信息</p>;

  const fields = Object.entries(info).filter(([, v]) => v);
  if (fields.length === 0) return <p className="text-sm text-slate-500">未填写基础信息</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fields.map(([key, value]) => (
        <div key={key} className="rounded-md bg-slate-50 p-3">
          <span className="text-xs font-medium text-slate-500">
            {fieldLabel(key, role)}
          </span>
          <p className="mt-1 text-sm font-medium text-slate-900">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

function fieldLabel(key: string, role: string): string {
  const labels: Record<string, string> = {
    companyName: "企业名称",
    companySize: "企业人数",
    city: "所在城市",
    industry: "行业类型",
    monthlySalary: role === "employee" ? "月工资" : "员工月工资",
    entryDate: role === "employee" ? "入职时间" : "员工入职时间",
    contact: "联系方式",
    hasHr: "HR 情况",
    hasEvidence: "证据情况",
    disputeOccurred: "争议状态",
    arbitrationNotice: "仲裁通知",
  };
  return labels[key] || key;
}

function AnswersTable({ answers }: { answers: DiagnosisAnswer[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <FileText className="h-4 w-4" />
          问卷回答明细 ({answers.length} 题)
        </h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  问题
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  回答
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">
                  分数
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  风险等级
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {answers.map((a) => (
                <tr key={a.questionId} className="hover:bg-slate-50">
                  <td className="max-w-[240px] px-4 py-2.5 text-sm text-slate-700">
                    {a.questionText}
                  </td>
                  <td className="max-w-[160px] px-4 py-2.5 text-sm font-medium text-slate-900">
                    {a.selected.label}
                  </td>
                  <td className="px-4 py-2.5 text-center text-sm text-slate-700">
                    {a.selected.score}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                        RISK_STYLES[a.selected.riskLevel]
                      }`}
                    >
                      {RISK_LABELS[a.selected.riskLevel]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <details className="border-t border-slate-200">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900">
              查看详细提示与法律依据
            </summary>
            <div className="space-y-3 px-4 pb-4">
              {answers.map((a) => (
                <div key={a.questionId} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-900">{a.questionText}</p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium">回复：</span>
                    {a.selected.label}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">风险原因：</span>
                    {a.selected.riskReason}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">建议：</span>
                    {a.selected.suggestion}
                  </p>
                  {a.selected.legalBasis && (
                    <p className="text-xs text-slate-500">
                      <span className="font-medium">法律依据：</span>
                      {a.selected.legalBasis}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function RiskResultCard({ result }: { result: RiskResult | null }) {
  if (!result) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        风险诊断结果
      </h3>
      <div className="mb-4 rounded-md bg-slate-50 p-4">
        <p className="text-sm leading-relaxed text-slate-700">{result.conclusion}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">
            主要争议点
          </h4>
          <ul className="space-y-1.5">
            {result.disputePoints.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">
            证据缺口
          </h4>
          <ul className="space-y-1.5">
            {result.evidenceGaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {result.suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">
            建议处理路径
          </h4>
          <ol className="space-y-1.5">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
      {result.legalBasisItems.length > 0 && (
        <div className="mt-4 rounded-md bg-blue-50 p-3">
          <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <BookOpen className="h-3.5 w-3.5" />
            法律依据
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {result.legalBasisItems.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ReportSection({ report }: { report: ReportData | null }) {
  if (!report) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          尚未生成 AI 完整报告
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          需要在完整报告页面生成后，才会显示在这里。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              <FileText className="h-3.5 w-3.5" />
              {report.reportNumber}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{report.reportTitle}</h3>
            <p className="mt-1 text-slate-600">{report.sceneType}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">生成日期</p>
            <p className="text-sm font-semibold text-slate-900">
              {report.reportDate}
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-semibold ${getRiskColor(
                report.riskLevel
              )}`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {report.riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Dispute Risk Analysis */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">争议风险分析</h3>
        </div>
        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm leading-relaxed text-slate-700">
            {report.disputeRiskAnalysis.summary}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {report.disputeRiskAnalysis.keyRisks.map((risk, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-4 ${getRiskColor(risk.level)}`}
            >
              <h4 className="mb-1.5 font-semibold text-slate-900">{risk.title}</h4>
              <p className="text-sm text-slate-700">{risk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Gaps */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2">
            <Search className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">证据缺口清单</h3>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  证据项目
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  重要性说明
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.evidenceGaps.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {item.item}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.importance}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusIcon(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Day Action Plan */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">7 天补强动作</h3>
        </div>
        <div className="space-y-4">
          {report.sevenDayActions.map((day, idx) => (
            <div key={idx} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {idx + 1}
                </div>
                {idx < report.sevenDayActions.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-slate-200" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="mb-2 font-semibold text-slate-900">{day.day}</h4>
                <ul className="space-y-1.5">
                  {day.actions.map((action, aIdx) => (
                    <li
                      key={aIdx}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Notes */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">沟通注意事项</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {report.communicationNotes.map((note, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">{note.audience}</h4>
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold text-emerald-700">应说明</p>
                <ul className="space-y-1">
                  {note.keyPoints.map((p, pIdx) => (
                    <li
                      key={pIdx}
                      className="flex items-start gap-1.5 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-red-700">应避免</p>
                <ul className="space-y-1">
                  {note.avoid.map((p, pIdx) => (
                    <li
                      key={pIdx}
                      className="flex items-start gap-1.5 text-sm text-slate-700"
                    >
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Templates */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-2">
            <FileCheck className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">常用文书模板清单</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {report.documentTemplates.map((doc, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 p-4 hover:border-slate-300"
            >
              <h4 className="mb-2 font-semibold text-slate-900">{doc.name}</h4>
              <p className="mb-2 text-sm text-slate-600">{doc.purpose}</p>
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">关键条款：</span>
                {doc.keyClauses.join("、")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Handling Path */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-slate-900 p-2">
            <GitBranch className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">处理路径建议</h3>
        </div>
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {report.handlingPath.options.map((option, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold text-slate-900">{option.path}</h4>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {option.successRate}
                </span>
              </div>
              <p className="mb-3 text-sm text-slate-600">{option.description}</p>
              <div className="mb-2">
                <p className="mb-1 text-xs font-semibold text-emerald-700">优势</p>
                <ul className="space-y-0.5">
                  {option.pros.map((pro, pIdx) => (
                    <li
                      key={pIdx}
                      className="flex items-start gap-1 text-xs text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-red-700">劣势</p>
                <ul className="space-y-0.5">
                  {option.cons.map((con, cIdx) => (
                    <li
                      key={cIdx}
                      className="flex items-start gap-1 text-xs text-slate-600"
                    >
                      <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-slate-900 p-5 text-white">
          <h4 className="mb-2 flex items-center gap-2 font-bold">
            <Scale className="h-5 w-5" />
            推荐方案
          </h4>
          <p className="text-sm leading-relaxed text-slate-300">
            {report.handlingPath.recommendation}
          </p>
        </div>
      </div>

      {/* Similar Cases */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-cyan-50 p-2">
            <BookOpen className="h-5 w-5 text-cyan-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">相似案例参考</h3>
        </div>
        <div className="space-y-4">
          {report.similarCases.map((c, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">{c.title}</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">情形</p>
                  <p className="text-sm text-slate-700">{c.situation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">处理结果</p>
                  <p className="text-sm text-slate-700">{c.result}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">关键依据</p>
                  <p className="text-sm text-slate-700">{c.basis}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">参考价值</p>
                  <p className="text-sm text-slate-700">{c.reference}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Basis */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <Scale className="h-5 w-5 text-slate-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">法律依据引用</h3>
        </div>
        <div className="space-y-3">
          {report.legalBasis.map((law, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-1 flex items-baseline gap-3">
                <span className="font-bold text-slate-900">{law.law}</span>
                <span className="text-sm font-semibold text-slate-600">
                  {law.article}
                </span>
              </div>
              <p className="text-sm text-slate-700">{law.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-800">
            {report.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminCaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        setAuthed(true);
      })
      .catch(() => {
        router.replace("/admin/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cases/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("案例不存在");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(`请求失败: ${res.status}`);
      }
      const json = (await res.json()) as CaseDetail;
      setDetail(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取案例详情失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [params.id]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">验证身份...</p>
      </main>
    );
  }

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <FileText className="h-5 w-5 text-slate-900" />
            <h1 className="text-sm font-semibold text-slate-900">案例详情</h1>
          </div>
          <button
            type="button"
            onClick={fetchDetail}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-3 text-lg font-semibold text-red-900">
              {error === "案例不存在" ? "案例不存在" : "加载失败"}
            </h2>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchDetail}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              重试
            </button>
          </div>
        )}

        {/* Detail */}
        {detail && (
          <div className="space-y-5">
            {/* Summary Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {detail.userRole === "employee" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Building2 className="h-3 w-3" />
                      )}
                      {detail.userRole === "employee" ? "员工方" : "企业方"}
                    </span>
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                        RISK_STYLES[detail.riskLevel] || ""
                      }`}
                    >
                      {RISK_LABELS[detail.riskLevel] || detail.riskLevel}
                    </span>
                    {detail.reportNumber && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                        <FileText className="h-3 w-3" />
                        {detail.reportNumber}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    {detail.sceneTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    创建于{" "}
                    {new Date(detail.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">风险总分</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {detail.riskScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <Building2 className="h-4 w-4" />
                基础信息
              </h3>
              <BasicInfoCard info={detail.basicInfo} role={detail.userRole} />
            </div>

            {/* Answers */}
            <AnswersTable answers={detail.answers} />

            {/* Risk Result */}
            <RiskResultCard result={detail.riskResult} />

            {/* AI Report */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText className="h-5 w-5" />
                AI 完整报告
                {detail.reportData && (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    已生成
                  </span>
                )}
              </h3>
              <ReportSection report={detail.reportData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
