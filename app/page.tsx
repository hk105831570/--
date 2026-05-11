import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileSearch, ShieldAlert, Users } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";

const values = ["识别当前争议风险等级", "检查企业证据链是否完整", "判断可能涉及的补偿或赔偿风险", "生成下一步合规处理建议", "支持人工复核与整改方案"];
const sceneNames = ["试用期解除", "违纪处理", "绩效不达标", "调岗降薪", "加班费", "离职补偿"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FB]">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <div className="inline-flex items-center rounded-md border border-red-100 bg-white px-3 py-1 text-sm font-medium text-danger shadow-sm">
            <ShieldAlert className="mr-2 h-4 w-4" />正式处理前的争议风险预检
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-ink sm:text-5xl">企业劳动纠纷风险诊断</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            员工处理不当，企业往往不是输在事实，而是输在证据和流程。
            通过 3 分钟场景问答，初步评估当前劳动纠纷风险、证据缺口与依法处理路径。
          </p>
          <div className="mt-6 rounded-lg border border-line bg-white p-4 text-sm leading-6 text-muted shadow-sm">
            老板和 HR 最怕的是“处理员工时以为自己有理，到了仲裁却拿不出证据”。本工具不替代律师，而是在正式处理前帮助企业提前发现风险。
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/role-select" className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#0f2d4d]">
              开始诊断当前纠纷<ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/review" className="inline-flex items-center justify-center rounded-md border border-line bg-white px-6 py-3 text-base font-semibold text-ink hover:border-navy">预约人工复核</Link>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="text-sm font-medium text-muted">场景化诊断面板</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">证据链与流程风险</h2>
            </div>
            <FileSearch className="h-9 w-9 text-navy" />
          </div>
          <div className="mt-5 grid gap-3">
            {values.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm text-ink">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sceneNames.map((scene) => <span key={scene} className="rounded-md border border-line bg-white px-3 py-2 text-center text-xs text-muted">{scene}</span>)}
          </div>
        </div>
      </section>
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-10 md:grid-cols-3">
          <div className="rounded-lg border border-line p-5"><ClipboardCheck className="h-7 w-7 text-navy" /><h3 className="mt-4 font-semibold text-ink">不是普通问卷</h3><p className="mt-2 text-sm leading-6 text-muted">围绕劳动纠纷真实争议点设计问题，直接定位依据、流程、送达和材料缺口。</p></div>
          <div className="rounded-lg border border-line p-5"><ShieldAlert className="h-7 w-7 text-danger" /><h3 className="mt-4 font-semibold text-ink">先发现风险</h3><p className="mt-2 text-sm leading-6 text-muted">在发通知、谈解除或进入仲裁前，先看清哪些材料可能支撑不足。</p></div>
          <div className="rounded-lg border border-line p-5"><Users className="h-7 w-7 text-navy" /><h3 className="mt-4 font-semibold text-ink">承接人工复核</h3><p className="mt-2 text-sm leading-6 text-muted">免费版展示基础诊断，复杂个案可进一步生成建议书或预约顾问复核。</p></div>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-5 py-8"><Disclaimer /></footer>
    </main>
  );
}
