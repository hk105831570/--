import type { RiskLevel } from "@/types/risk";

const styles: Record<RiskLevel, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-700",
  critical: "border-red-300 bg-red-100 text-red-900"
};

export default function RiskBadge({ level, text }: { level: RiskLevel; text: string }) {
  return <span className={`inline-flex rounded-md border px-2.5 py-1 text-sm font-semibold ${styles[level]}`}>{text}</span>;
}
