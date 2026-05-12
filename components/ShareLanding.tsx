"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, Share2, Check, Copy } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { saveShareTracking } from "@/lib/storage";
import { copyToClipboard, SHARE_ID_TO_NAME, LEVEL_LABELS, ROLE_LABELS } from "@/lib/share";

function BannerContent() {
  const searchParams = useSearchParams();
  const isFromShare = searchParams.get("ref") === "share";
  const shareScene = searchParams.get("scene") || "";
  const shareRole = searchParams.get("role") || "";
  const shareLevel = searchParams.get("level") || "";
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isFromShare && shareScene) {
      saveShareTracking({
        fromShare: true,
        shareScene,
        shareRole,
        shareLevel,
        landingTime: new Date().toISOString(),
      });
    }
  }, [isFromShare, shareScene, shareRole, shareLevel]);

  if (!isFromShare || dismissed) return null;

  const sceneName = SHARE_ID_TO_NAME[shareScene] || shareScene;
  const roleLabel = ROLE_LABELS[shareRole] || shareRole;
  const levelLabel = LEVEL_LABELS[shareLevel] || shareLevel;

  return (
    <div className="relative mx-auto mt-4 max-w-6xl rounded-lg border border-[#fca5a5] bg-[#fef2f2] px-5 py-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-red-400 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm leading-relaxed text-red-900">
        你的朋友在<strong>{sceneName}</strong>中诊断出<strong>{levelLabel}</strong>
        <span className="ml-1 text-xs text-red-600">（{roleLabel}）</span>
      </p>
      <p className="mt-1 text-sm text-red-800">点击下方按钮，诊断你自己的情况</p>
      <Link
        href="/role-select"
        className="mt-3 inline-flex items-center rounded-md bg-[#b91c1c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        开始我的诊断
      </Link>
    </div>
  );
}

function RecommendContent() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `推荐一个劳动纠纷风险诊断工具，企业HR和员工都能用，3分钟问卷诊断仲裁胜算，免费。\nhttps://www.laodongjiufen.xin`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-5 py-6 text-center">
      <h3 className="text-sm font-semibold text-gray-800">
        觉得有用？把这个工具推荐给需要的人
      </h3>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#1a2b4a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1f36]"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "链接已复制" : "复制工具链接"}
      </button>
      {copied && (
        <p className="mt-2 text-xs text-emerald-600">
          链接已复制，可直接粘贴到微信发送给朋友
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        适合推荐给：正在处理员工问题的 HR · 遇到劳动纠纷的朋友 · 中小企业老板
      </p>
    </div>
  );
}

export function ShareBanner() {
  return (
    <Suspense fallback={null}>
      <BannerContent />
    </Suspense>
  );
}

export function ShareRecommend() {
  return <RecommendContent />;
}
