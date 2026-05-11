import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, MessageSquare, UserCheck } from "lucide-react";

const plans = [
  { title: "免费版", icon: CheckCircle2, description: "查看基础风险等级、主要争议点和初步处理建议。", cta: "返回查看诊断结果", href: "/result", items: ["基础风险等级", "主要争议点", "初步处理建议"] },
  { title: "完整方案版", icon: FileText, description: "生成《劳动纠纷处理建议书》，用于内部复盘和下一步处理准备。", cta: "获取完整处理建议书", href: "/complete-report", items: ["争议风险分析", "证据缺口清单", "7 天补强动作", "沟通注意事项", "常用文书模板清单", "处理路径建议"] },
  { title: "人工复核版", icon: UserCheck, description: "由顾问基于企业实际材料进行复核，输出定制化处理建议。", cta: "预约人工复核", href: "#", items: ["材料清单复核", "处理路径评估", "沟通和文书建议", "关键风险提示"] }
];

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/result" className="inline-flex items-center text-sm font-medium text-muted hover:text-navy"><ArrowLeft className="mr-1 h-4 w-4" />返回诊断结果</Link>
        <section className="mt-8 rounded-lg border border-line bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-semibold text-danger">人工复核与完整方案</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">把“知道有风险”推进到“知道下一步怎么做”</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">免费版帮助企业看见基础风险。若当前已准备处理员工、双方沟通紧张或仲裁风险已经出现，建议进一步梳理证据链和处理路径，再决定是否推进。</p>
        </section>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <section key={plan.title} className="flex min-h-[420px] flex-col rounded-lg border border-line bg-white p-6 shadow-sm">
                <Icon className="h-8 w-8 text-navy" />
                <h2 className="mt-4 text-xl font-semibold text-ink">{plan.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{plan.description}</p>
                <ul className="mt-5 flex-1 space-y-3 text-sm text-muted">{plan.items.map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>
                <Link href={plan.href} className={`mt-6 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold ${plan.title === "免费版" ? "border border-line bg-white text-ink" : "bg-navy text-white hover:bg-[#0f2d4d]"}`}>{plan.cta}</Link>
              </section>
            );
          })}
        </div>
        <section className="mt-6 rounded-lg border border-red-100 bg-white p-6 shadow-panel sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-xl font-semibold text-ink">需要顾问看材料时，可以先添加微信沟通</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">第一版暂不接真实支付。这里可作为获客转化入口，后续接入微信、支付、PDF 报告和顾问工作台。</p></div>
            <button className="inline-flex items-center justify-center rounded-md bg-danger px-5 py-3 text-sm font-semibold text-white"><MessageSquare className="mr-2 h-4 w-4" />添加顾问微信</button>
          </div>
        </section>
      </div>
    </main>
  );
}
