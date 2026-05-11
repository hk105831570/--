"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { questionsByScene } from "@/data/questions";
import { getSceneById } from "@/data/scenes";
import { saveDiagnosis, getUserRole } from "@/lib/storage";
import type { DiagnosisAnswer, QuestionOption } from "@/types/risk";

export default function DiagnosePage() {
  const router = useRouter();
  const params = useParams<{ scene: string }>();
  const sceneId = params.scene;
  const questions = questionsByScene[sceneId] || [];
  const scene = useMemo(() => getSceneById(sceneId), [sceneId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswer[]>([]);
  const current = questions[index];
  const selected = answers[index]?.selected;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function select(option: QuestionOption) {
    if (!current || !scene) return;
    const updated = [...answers];
    updated[index] = { questionId: current.id, questionText: current.text, selected: option };
    setAnswers(updated);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (index < questions.length - 1) {
        setIndex((v) => v + 1);
      } else {
        saveDiagnosis({ sceneId, sceneTitle: scene.title, userRole: getUserRole(), answers: updated });
        router.push("/result");
      }
    }, 400);
  }

  function next() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!current || !selected || !scene) return;
    if (index < questions.length - 1) {
      setIndex((v) => v + 1);
      return;
    }
    saveDiagnosis({ sceneId, sceneTitle: scene.title, userRole: getUserRole(), answers });
    router.push("/result");
  }

  if (!current || !scene) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB] px-5"><div className="rounded-lg border border-line bg-white p-8 text-center shadow-panel"><h1 className="text-xl font-semibold text-ink">该场景暂未开放</h1><Link href="/scenes" className="mt-5 inline-flex rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white">返回场景选择</Link></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/scenes" className="inline-flex items-center text-sm font-medium text-muted hover:text-navy"><ArrowLeft className="mr-1 h-4 w-4" />返回场景选择</Link>
        <div className="mt-7 rounded-lg border border-line bg-white p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-danger">{scene.title}</p>
            <p className="mt-1 text-sm text-muted">一步一问，聚焦证据链、程序和争议点。</p>
          </div>
          <ProgressBar current={index + 1} total={questions.length} />
        </div>
        <div className="mt-5"><QuestionCard question={current} selected={selected} onSelect={select} /></div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setIndex((v) => Math.max(0, v - 1)); }} disabled={index === 0} className="rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50">上一题</button>
          <button type="button" onClick={next} disabled={!selected} className="inline-flex items-center rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{index === questions.length - 1 ? "查看我的争议风险" : "下一题"}<ArrowRight className="ml-2 h-4 w-4" /></button>
        </div>
      </div>
    </main>
  );
}
