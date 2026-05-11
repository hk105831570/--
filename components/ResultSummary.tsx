import RiskBadge from "@/components/RiskBadge";
import type { RiskResult } from "@/types/risk";

export default function ResultSummary({ result, employee }: { result: RiskResult; employee?: boolean }) {
  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-panel sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{employee ? "您的权益保障情况" : "当前争议风险等级"}</p>
          <div className="mt-3"><RiskBadge level={result.level} text={result.levelText} /></div>
        </div>
        <div className="rounded-lg bg-slate-50 px-5 py-4 text-center">
          <p className="text-sm text-muted">{employee ? "评估总评分" : "风险总分"}</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{result.score}</p>
        </div>
      </div>
      <div className="mt-7 border-t border-line pt-6">
        <h2 className="font-semibold text-ink">初步判断</h2>
        <p className="mt-3 leading-7 text-muted">{result.conclusion}</p>
        <p className="mt-3 rounded-md bg-softRed p-4 text-sm leading-6 text-danger">{result.handlingAdvice}</p>
      </div>
    </section>
  );
}
