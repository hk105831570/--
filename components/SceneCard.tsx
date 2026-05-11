"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Scene } from "@/types/risk";
import { getUserRole } from "@/lib/storage";

export default function SceneCard({ scene }: { scene: Scene }) {
  const [desc, setDesc] = useState(scene.description);
  const open = scene.status === "available";

  useEffect(() => {
    const role = getUserRole();
    setDesc(role === "employee" ? scene.employeeDesc : scene.description);
  }, [scene]);

  return (
    <Link href={open ? `/basic-info?scene=${scene.id}` : "#"} className={`group flex min-h-44 flex-col justify-between rounded-lg border bg-white p-5 shadow-sm transition ${open ? "border-line hover:-translate-y-0.5 hover:border-navy hover:shadow-panel" : "pointer-events-none border-slate-200 opacity-65"}`}>
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{scene.title}</h3>
          {!open && <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" />即将开放</span>}
        </div>
        <p className="text-sm leading-6 text-muted">{desc}</p>
      </div>
      <div className="mt-5 flex items-center text-sm font-medium text-navy">
        {open ? "进入场景诊断" : "第一版暂未开放"}
        {open && <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />}
      </div>
    </Link>
  );
}
