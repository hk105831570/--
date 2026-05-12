"use client";

import { useState } from "react";
import { Share2, Check, Copy, Image } from "lucide-react";
import { copyToClipboard, buildShareUrl } from "@/lib/share";

interface ShareButtonProps {
  scene: string;
  role: "employer" | "employee";
  level: string;
  variant: "result" | "home";
}

export default function ShareButton({ scene, role, level, variant }: ShareButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageDone, setImageDone] = useState(false);

  const handleCopyLink = async () => {
    const url = buildShareUrl(scene, role, level);
    const ok = await copyToClipboard(url);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (variant === "home") {
    return (
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f2d4d]"
      >
        {linkCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {linkCopied ? "已复制" : "复制工具链接"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-slate-50"
      >
        {linkCopied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {linkCopied ? "已复制 ✓" : "复制分享链接"}
      </button>
      <button
        type="button"
        onClick={async () => {
          const { default: html2canvas } = await import("html2canvas");

          const canvas = document.createElement("canvas");
          canvas.width = 540;
          canvas.height = 360;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Background
          ctx.fillStyle = "#1a2b4a";
          ctx.fillRect(0, 0, 540, 360);

          // Decorative top bar
          ctx.fillStyle = "#b91c1c";
          ctx.fillRect(0, 0, 540, 6);

          // Title
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 28px -apple-system, 'PingFang SC', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("劳动纠纷风险诊断", 270, 80);

          // Domain
          ctx.fillStyle = "#94a3b8";
          ctx.font = "14px -apple-system, 'PingFang SC', sans-serif";
          ctx.fillText("laodongjiufen.xin", 270, 108);

          // Divider line
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(80, 132);
          ctx.lineTo(460, 132);
          ctx.stroke();

          // Scene name
          ctx.fillStyle = "#e2e8f0";
          ctx.font = "20px -apple-system, 'PingFang SC', sans-serif";
          ctx.fillText("诊断场景", 270, 170);

          const sceneMap: Record<string, string> = {
            probation: "试用期解除争议",
            misconduct: "员工违纪处理争议",
            performance: "绩效不达标处理争议",
            transfer: "调岗降薪争议",
            overtime: "加班费争议",
            severance: "离职补偿争议",
          };
          const sceneName = sceneMap[scene] || scene;
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 24px -apple-system, 'PingFang SC', sans-serif";
          ctx.fillText(sceneName, 270, 208);

          // Role
          const roleLabel = role === "employee" ? "员工方" : "企业方";
          ctx.fillStyle = "#94a3b8";
          ctx.font = "16px -apple-system, 'PingFang SC', sans-serif";
          ctx.fillText(roleLabel, 270, 248);

          // Risk level
          const levelColors: Record<string, string> = {
            low: "#22c55e",
            medium: "#f59e0b",
            high: "#ef4444",
            critical: "#dc2626",
          };
          const levelLabels: Record<string, string> = {
            low: "低风险",
            medium: "中风险",
            high: "高风险",
            critical: "极高风险",
          };
          ctx.fillStyle = levelColors[level] || "#ef4444";
          ctx.font = "bold 32px -apple-system, 'PingFang SC', sans-serif";
          ctx.fillText(levelLabels[level] || level, 270, 298);

          // Tagline
          ctx.fillStyle = "#94a3b8";
          ctx.font = "14px -apple-system, 'PingFang SC', sans-serif";
          ctx.fillText("先诊断，再行动", 270, 335);

          // Convert to image and download
          const link = document.createElement("a");
          link.download = `劳动纠纷风险诊断-${sceneName}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          setImageDone(true);
          setTimeout(() => setImageDone(false), 2000);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-slate-50"
      >
        {imageDone ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Image className="h-4 w-4" />
        )}
        {imageDone ? "已生成 ✓" : "生成分享图片"}
      </button>
    </div>
  );
}
