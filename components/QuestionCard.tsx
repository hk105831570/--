"use client";

import { useEffect, useState } from "react";
import type { Question, QuestionOption } from "@/types/risk";
import { getUserRole } from "@/lib/storage";

export default function QuestionCard({ question, selected, onSelect }: { question: Question; selected?: QuestionOption; onSelect: (option: QuestionOption) => void }) {
  const [role, setRole] = useState<"employer" | "employee">("employer");

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const questionText = role === "employee" && question.employeeLabel ? question.employeeLabel : question.text;
  const optionLabel = (opt: QuestionOption) => role === "employee" && opt.employeeLabel ? opt.employeeLabel : opt.label;

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel sm:p-7">
      <p className="mb-5 text-sm font-medium text-navy">请根据当前真实情况选择</p>
      <h1 className="text-xl font-semibold leading-8 text-ink sm:text-2xl">{questionText}</h1>
      <div className="mt-7 grid gap-3">
        {question.options.map((option) => {
          const active = selected?.label === option.label;
          return (
            <button key={option.label} type="button" onClick={() => onSelect(option)} className={`rounded-lg border p-4 text-left transition ${active ? "border-navy bg-softBlue text-ink" : "border-line bg-white text-ink hover:border-slate-400 hover:bg-slate-50"}`}>
              <span className="block font-medium">{optionLabel(option)}</span>
              {active && <span className="mt-2 block text-sm leading-6 text-muted">{option.suggestion}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
