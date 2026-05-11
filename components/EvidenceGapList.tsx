import { AlertTriangle } from "lucide-react";

export default function EvidenceGapList({ items, employee }: { items: string[]; employee?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <h3 className="flex items-center gap-2 font-semibold text-ink"><AlertTriangle className="h-4 w-4 text-warning" />{employee ? "您需要保留的关键证据" : "证据缺口清单"}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
        {items.map((item) => <li key={item} className="rounded-md bg-slate-50 p-3">{item}</li>)}
      </ul>
    </div>
  );
}
