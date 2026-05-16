'use client';
import { useEffect } from 'react';
import { formatCurrency } from './utils';
import type { AnnualInput } from './utils';

interface Props {
  value: AnnualInput;
  onChange: (input: AnnualInput) => void;
}

function NumInput({ label, value, onChange, hint }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        min={0}
        step={0.5}
        onChange={e => {
          const v = parseFloat(e.target.value);
          onChange(!isNaN(v) && v >= 0 ? v : 0);
        }}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function Block3AnnualInput({ value, onChange }: Props) {
  const totalHours = value.weekdayOvertimeHours + value.weekendOvertimeHours + value.holidayOvertimeHours;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
        年度工时设置
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <NumInput
          label="全年平日加班（小时）"
          value={value.weekdayOvertimeHours}
          hint="8h 外的平日超时"
          onChange={v => onChange({ ...value, weekdayOvertimeHours: v })}
        />
        <NumInput
          label="全年周末加班（小时）"
          value={value.weekendOvertimeHours}
          hint="周六、周日工作"
          onChange={v => onChange({ ...value, weekendOvertimeHours: v })}
        />
        <NumInput
          label="全年节假日加班（小时）"
          value={value.holidayOvertimeHours}
          hint="法定节假日工作"
          onChange={v => onChange({ ...value, holidayOvertimeHours: v })}
        />
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 flex items-center justify-between">
        <span className="text-sm text-gray-700">全年合计加班小时数</span>
        <span className="text-2xl font-bold text-blue-600 tabular-nums">{totalHours.toFixed(1)} h</span>
      </div>
    </section>
  );
}
