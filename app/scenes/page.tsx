import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SceneCard from "@/components/SceneCard";
import { scenes } from "@/data/scenes";

export default function ScenesPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted hover:text-navy"><ArrowLeft className="mr-1 h-4 w-4" />返回首页</Link>
        <div className="mt-8">
          <p className="text-sm font-semibold text-danger">选择当前争议场景</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">先定位场景，再判断证据和流程风险</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">不同劳动纠纷的争议焦点不同。请选择最接近当前情况的场景，系统会基于对应规则进行初步诊断。</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{scenes.map((scene) => <SceneCard key={scene.id} scene={scene} />)}</div>
      </div>
    </main>
  );
}
