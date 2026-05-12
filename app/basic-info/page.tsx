"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSceneById } from "@/data/scenes";
import { saveBasicInfo, getUserRole } from "@/lib/storage";
import type { BasicInfo } from "@/types/risk";

type FieldDef = { name: keyof BasicInfo; label: string; placeholder: string; type?: string; optional?: true };

const employerFields: FieldDef[] = [
  { name: "companyName", label: "企业名称", placeholder: "例如：某某科技有限公司", optional: true },
  { name: "companySize", label: "企业人数", placeholder: "例如：30-50 人" },
  { name: "city", label: "所在城市", placeholder: "例如：上海" },
  { name: "industry", label: "行业类型", placeholder: "例如：制造业 / 零售 / 互联网" },
  { name: "monthlySalary", label: "员工月工资", placeholder: "例如：12000 元" },
  { name: "entryDate", label: "员工入职时间", placeholder: "请选择日期", type: "date" },
  { name: "contact", label: "联系方式（手机号或微信号）", placeholder: "用于人工复核时联系", optional: true },
];

const employeeFields: FieldDef[] = [
  { name: "companyName", label: "公司名称", placeholder: "例如：某某科技有限公司", optional: true },
  { name: "city", label: "所在城市", placeholder: "例如：上海" },
  { name: "industry", label: "行业类型", placeholder: "例如：制造业 / 零售 / 互联网" },
  { name: "monthlySalary", label: "您的月工资", placeholder: "例如：12000 元" },
  { name: "entryDate", label: "入职时间", placeholder: "请选择日期", type: "date" },
  { name: "contact", label: "联系方式（手机号或微信号）", placeholder: "用于人工复核时联系", optional: true },
];

function BasicInfoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sceneId = searchParams.get("scene") || "probation-termination";
  const scene = useMemo(() => getSceneById(sceneId), [sceneId]);
  const [role, setRole] = useState<"employer" | "employee">("employer");
  const [form, setForm] = useState<BasicInfo>({ hasHr: "有专职 HR", disputeOccurred: "尚未正式发生", arbitrationNotice: "尚未收到" });

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const isEmployee = role === "employee";

  function update(name: keyof BasicInfo, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveBasicInfo(form);
    router.push(`/diagnose/${sceneId}`);
  }

  const fields = isEmployee ? employeeFields : employerFields;

  const employerSelects = [
    { name: "hasHr" as const, label: "是否有专职 HR", options: ["有专职 HR", "无专职 HR", "外包或兼职处理"] },
    { name: "disputeOccurred" as const, label: "当前是否已经发生争议", options: ["尚未正式发生", "已经发生沟通争议", "已升级为正式争议"] },
    { name: "arbitrationNotice" as const, label: "是否已经收到仲裁通知", options: ["尚未收到", "已经收到", "不确定"] },
  ];

  const employeeSelects = [
    { name: "hasEvidence" as const, label: "您手上是否有相关证据", options: ["有，比较完整", "有部分证据", "暂未保留证据"] },
    { name: "disputeOccurred" as const, label: "当前是否已经发生争议", options: ["尚未正式发生", "已经发生沟通争议", "已升级为正式争议"] },
    { name: "arbitrationNotice" as const, label: "是否已经收到仲裁通知", options: ["尚未收到", "已经收到", "不确定"] },
  ];

  const selects = isEmployee ? employeeSelects : employerSelects;

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/scenes" className="inline-flex items-center text-sm font-medium text-muted hover:text-navy"><ArrowLeft className="mr-1 h-4 w-4" />返回场景选择</Link>
        <div className="mt-8 rounded-lg border border-line bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-semibold text-danger">{isEmployee ? "个人信息" : "企业基础信息"}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{scene?.title || "劳动纠纷风险诊断"}</h1>
          <p className="mt-3 leading-7 text-muted">{isEmployee ? "基础信息会保存在当前浏览器，用于生成更贴近您实际情况的权益评估。第一版不需要登录。" : "基础信息会保存在当前浏览器，用于生成更贴近实际情况的风险提示。第一版不需要登录。"}</p>
          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className="grid gap-2 text-sm font-medium text-ink">
                  <span>{field.label}{field.optional && <span className="ml-1 text-muted">（选填）</span>}</span>
                  <input type={field.type || "text"} value={form[field.name] || ""} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder} required={!field.optional} className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-blue-100" />
                </label>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {selects.map((field) => (
                <label key={field.name} className="grid gap-2 text-sm font-medium text-ink">
                  {field.label}
                  <select value={form[field.name] || ""} onChange={(event) => update(field.name, event.target.value)} required className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-blue-100">
                    <option value="">请选择</option>
                    {field.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <button type="submit" className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-navy px-6 py-3 font-semibold text-white hover:bg-[#0f2d4d] sm:w-fit">{isEmployee ? "进入权益评估问卷" : "进入诊断问卷"}<ArrowRight className="ml-2 h-5 w-5" /></button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function BasicInfoPage() {
  return <Suspense><BasicInfoForm /></Suspense>;
}
