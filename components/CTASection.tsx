import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection({ title = "正式处理前，先把证据和流程看清楚", description = "免费版用于发现基础风险。若已经进入争议、准备发通知或收到仲裁材料，建议进一步获取完整处理建议书或人工复核。", buttonText = "获取完整处理建议书" }: { title?: string; description?: string; buttonText?: string }) {
  return (
    <section className="rounded-lg border border-red-100 bg-white p-6 shadow-panel sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
        <Link href="/review" className="inline-flex shrink-0 items-center justify-center rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0f2d4d]">
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
