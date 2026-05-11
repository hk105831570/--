export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>诊断进度</span>
        <span>{current}/{total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-navy transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
