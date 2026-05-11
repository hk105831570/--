import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企业劳动纠纷风险诊断",
  description: "通过场景化问答初步评估劳动纠纷风险、证据缺口与依法处理路径。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
