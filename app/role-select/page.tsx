"use client";

import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { saveUserRole, clearDiagnosis } from "@/lib/storage";

export default function RoleSelectPage() {
  const router = useRouter();

  function select(role: "employer" | "employee") {
    clearDiagnosis();
    saveUserRole(role);
    router.push("/scenes");
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-2xl pt-10 sm:pt-16">
        <p className="text-center text-sm font-semibold text-danger">选择您的身份</p>
        <h1 className="mt-3 text-center text-3xl font-semibold text-ink sm:text-4xl">请问您是哪一方？</h1>
        <p className="mx-auto mt-3 max-w-lg text-center leading-7 text-muted">
          本工具同时支持企业方风险诊断和员工方权益评估，请根据您的身份选择进入。
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => select("employer")}
            className="group flex flex-col items-center rounded-xl border border-line bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-navy hover:shadow-panel"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-softBlue">
              <Building2 className="h-8 w-8 text-navy" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-ink">我是企业 / HR / 老板</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              我想评估当前处理方案的合规风险，避免仲裁败诉
            </p>
          </button>

          <button
            type="button"
            onClick={() => select("employee")}
            className="group flex flex-col items-center rounded-xl border border-line bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-panel"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-ink">我是员工</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              我想了解自己是否有权主张赔偿，以及如何维权
            </p>
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          本工具同时支持企业方风险诊断和员工方权益评估
        </p>
      </div>
    </main>
  );
}
