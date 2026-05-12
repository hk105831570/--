"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, FileWarning, Route, Scale, ChevronDown, ChevronUp, BookOpen, Gavel, Share2, Lock } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import Disclaimer from "@/components/Disclaimer";
import EvidenceGapList from "@/components/EvidenceGapList";
import ResultSummary from "@/components/ResultSummary";
import { calculateRisk } from "@/lib/calculateRisk";
import { getDiagnosis, getBasicInfo, saveCaseId, saveAccessToken } from "@/lib/storage";
import type { DiagnosisSession } from "@/types/risk";

interface CompensationItem {
  name: string;
  rule: string;
  basis: string;
}

function getCompensationItems(sceneId: string): CompensationItem[] {
  switch (sceneId) {
    case "probation-termination":
      return [
        { name: "违法解除赔偿金（2N）", rule: "如解除程序违法，可主张工作年限 × 2个月工资", basis: "《劳动合同法》第47条（计算标准）、第87条（违法解除）" },
        { name: "经济补偿金（N）", rule: "如解除合法但属于非过失性解除，可主张工作年限 × 1个月工资", basis: "《劳动合同法》第46条（适用情形）、第47条（计算标准）" },
      ];
    case "disciplinary-dispute":
      return [
        { name: "违法解除赔偿金（2N）", rule: "如违纪依据不足或程序违法，可主张工作年限 × 2个月工资", basis: "《劳动合同法》第47条、第87条" },
        { name: "经济补偿金（N）", rule: "如违纪不成立但解除已成事实，可主张工作年限 × 1个月工资", basis: "《劳动合同法》第46条、第47条" },
      ];
    case "performance-dispute":
      return [
        { name: "违法解除赔偿金（2N）", rule: "如未履行培训或调岗程序直接解除，可主张工作年限 × 2个月工资", basis: "《劳动合同法》第47条、第87条" },
        { name: "经济补偿金（N）", rule: "如已履行培训/调岗程序后仍不能胜任，可主张工作年限 × 1个月工资", basis: "《劳动合同法》第40条第二款、第46条、第47条" },
      ];
    case "job-salary-adjustment":
      return [
        { name: "工资差额", rule: "调岗后工资降低的部分，可主张补足差额", basis: "《劳动合同法》第35条：变更劳动合同须协商一致" },
        { name: "被迫解除经济补偿金（N）", rule: "如因违法调岗降薪被迫离职，可主张工作年限 × 1个月工资", basis: "《劳动合同法》第38条、第46条、第47条" },
      ];
    case "overtime-pay":
      return [
        { name: "平时延时加班费", rule: "工作日延长工作时间，按工资的150%支付", basis: "《劳动法》第44条第一项" },
        { name: "休息日加班费", rule: "休息日工作又不能补休的，按工资的200%支付", basis: "《劳动法》第44条第二项" },
        { name: "法定节假日加班费", rule: "法定休假日工作的，按工资的300%支付", basis: "《劳动法》第44条第三项" },
      ];
    case "departure-compensation":
      return [
        { name: "经济补偿金（N）", rule: "非因员工过失解除或到期不续签，工作年限 × 1个月工资", basis: "《劳动合同法》第46条、第47条" },
        { name: "违法解除赔偿金（2N）", rule: "如解除程序违法或理由不成立，可主张工作年限 × 2个月工资", basis: "《劳动合同法》第47条、第87条" },
        { name: "未休年假折算工资", rule: "未休年假按日工资的200%折算", basis: "《职工带薪年休假条例》第5条" },
      ];
    default:
      return [
        { name: "经济补偿金（N）", rule: "工作年限 × 1个月工资", basis: "《劳动合同法》第47条" },
        { name: "违法解除赔偿金（2N）", rule: "如构成违法解除，可主张工作年限 × 2个月工资", basis: "《劳动合同法》第87条" },
      ];
  }
}

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<DiagnosisSession | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const [basicInfo, setBasicInfo] = useState<ReturnType<typeof getBasicInfo>>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSession(getDiagnosis());
    setBasicInfo(getBasicInfo());
  }, []);
  const result = useMemo(() => (session ? calculateRisk(session.answers, session.userRole) : null), [session]);

  // Auto-save diagnosis data to database
  useEffect(() => {
    if (!session || !result || !basicInfo || saved) return;
    fetch("/api/cases/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basicInfo, session, riskResult: result })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.caseId) {
          saveCaseId(data.caseId);
          if (data.accessToken) {
            saveAccessToken(data.accessToken);
          }
          setSaved(true);
        }
      })
      .catch(() => {
        // Non-blocking - localStorage remains the primary data store
      });
  }, [session, result, basicInfo, saved]);

  if (!session || !result) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5"><div className="rounded-lg border border-line bg-white p-8 text-center shadow-panel"><h1 className="text-xl font-semibold text-ink">暂无诊断结果</h1><p className="mt-2 text-sm text-muted">请先完成一个场景问卷，再查看结果。</p><Link href="/scenes" className="mt-5 inline-flex rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white">开始诊断当前纠纷</Link></div></main>;
  }

  const isEmployee = session.userRole === "employee";
  const legalBasis = result.legalBasisItems.length > 0 ? result.legalBasisItems : null;

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-danger">{isEmployee ? "员工权益评估" : "基础诊断结果"}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{isEmployee ? "员工权益评估报告" : session.sceneTitle}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted">
            {isEmployee
              ? "以下结果基于你已填写的信息生成。它不是正式法律意见，而是在正式维权前帮助你了解自身权益、可能的赔偿项目和需要保留的关键证据。"
              : "以下结果基于你已填写的信息生成。它的价值不是替代律师判断，而是在正式处理前帮助企业提前发现依据、证据和流程中的风险。"}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.88fr]">
          <ResultSummary result={result} employee={isEmployee} />
          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <h2 className="flex items-center gap-2 font-semibold text-ink"><Scale className="h-4 w-4 text-navy" />{isEmployee ? "可能的法律后果" : "可能后果"}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">{result.consequences.map((item) => <li key={item} className="rounded-md bg-slate-50 p-3">{item}</li>)}</ul>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-line bg-white p-5">
            <h3 className="flex items-center gap-2 font-semibold text-ink"><FileWarning className="h-4 w-4 text-danger" />{isEmployee ? "您可能有权主张的项目" : "主要争议点"}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">{result.disputePoints.map((item) => <li key={item} className="rounded-md bg-slate-50 p-3">{item}</li>)}</ul>
          </div>
          <EvidenceGapList items={result.evidenceGaps} employee={isEmployee} />
          <div className="rounded-lg border border-line bg-white p-5">
            <h3 className="flex items-center gap-2 font-semibold text-ink"><Route className="h-4 w-4 text-navy" />{isEmployee ? "维权操作建议" : "建议处理路径"}</h3>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted">{result.suggestions.map((item, idx) => <li key={item} className="rounded-md bg-slate-50 p-3">{idx + 1}. {item}</li>)}</ol>
          </div>
        </div>

        {/* 员工方：预估可主张金额（按场景动态展示） */}
        {isEmployee && session && (() => {
          const items = getCompensationItems(session.sceneId);
          const salary = basicInfo?.monthlySalary || "";
          return (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-emerald-900"><Gavel className="h-4 w-4" />预估可主张金额（仅供参考）</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                根据当前"{session.sceneTitle}"场景，您可能有权主张以下赔偿项目。
                {salary && <>您的月工资为 <strong>{salary}</strong>，可用于估算具体金额。</>}
                以下金额需结合工作年限和当地政策确定。
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-emerald-900">
                {items.map((item) => (
                  <li key={item.name} className="rounded-md bg-white p-3">
                    • <strong>{item.name}：</strong>{item.rule}
                    <br /><span className="text-xs text-emerald-600">依据：{item.basis}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-emerald-700">以上金额仅为计算规则说明，不构成具体金额承诺。建议咨询专业律师获取准确评估。</p>
            </div>
          );
        })()}

        {/* 法律依据折叠卡片 */}
        {legalBasis && (
          <div className="mt-5 rounded-lg border border-line bg-white">
            <button
              type="button"
              onClick={() => setLegalOpen(!legalOpen)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <h3 className="flex items-center gap-2 font-semibold text-ink"><BookOpen className="h-4 w-4 text-navy" />本次诊断涉及的法律条文</h3>
              {legalOpen ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
            </button>
            {legalOpen && (
              <div className="border-t border-line px-5 pb-5 pt-3">
                <p className="mb-3 text-sm text-muted">根据您的填写情况，以下法规与本案最相关：</p>
                <ul className="space-y-2">
                  {legalBasis.map((item, idx) => (
                    <li key={idx} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-muted">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-amber-900"><ClipboardList className="h-4 w-4" />{isEmployee ? "是否需要进一步咨询" : "是否建议人工复核"}</h3>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            {isEmployee
              ? "建议进一步咨询专业律师，尤其是在准备提起仲裁、已经收到公司通知或争议金额较高时。本评估结果不能替代正式法律意见。"
              : result.needsReview ? "建议进行人工复核，尤其是在准备发出处理决定、员工已明确提出异议或已经收到仲裁通知时。" : "当前可先完成内部证据归档和流程复核；如涉及金额较高、特殊身份或争议已升级，也建议人工复核。"}
          </p>
        </div>

        {/* 分享区块 */}
        <div className="mt-5 rounded-lg border border-line bg-white p-5">
          <h3 className="flex items-center gap-2 font-semibold text-ink"><Share2 className="h-4 w-4 text-navy" />把诊断结果分享给同事或朋友</h3>
          <div className="mt-4">
            <ShareButton scene={session.sceneId} role={session.userRole} level={result.level} variant="result" />
          </div>
          <p className="mt-3 text-xs text-muted">分享内容仅展示风险等级和场景类型，不包含填写的具体信息</p>
        </div>

        {/* 付费解锁提示 — 价值导向，不显示价格 */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <Lock className="h-4 w-4" />
            免费结果只是第一步
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            上面的评估展示了基本情况，但处理劳动纠纷的关键在于行动。完整方案会告诉你每一步具体做什么、准备什么、注意什么。
          </p>
          <ul className="mt-4 space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">→</span>
              <span><strong>7 天补强行动方案</strong> — 从今天开始每天该做什么，按时间顺序列出</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">→</span>
              <span><strong>证据缺口清单</strong> — 你缺少哪些关键证据、怎么补充</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">→</span>
              <span><strong>常用文书模板</strong> — 辞职函、协商记录、仲裁申请等模板清单</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">→</span>
              <span><strong>处理路径对比</strong> — 协商、调解、仲裁三条路各自怎么走</span>
            </li>
          </ul>
          <Link
            href="/pay"
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f1f36]"
          >
            查看完整方案详解 →
          </Link>
        </div>

        <div className="mt-5">
          <Link href="/scenes" className="inline-flex items-center justify-center rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink">重新选择场景</Link>
        </div>

        <footer className="mt-8"><Disclaimer /></footer>
      </div>
    </main>
  );
}
