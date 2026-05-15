'use client';
import { useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { MONTH_NAMES } from './constants';
import { calculateMonthlyPay, formatCurrency } from './utils';
import type { SalaryConfig, MonthlyInput } from './types';

interface Props {
  config: SalaryConfig;
  year: number;
  monthlyInputs: Record<string, MonthlyInput>;
  getMonthlyInput: (year: number, month: number) => MonthlyInput;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Block4Summary({
  config, year, getMonthlyInput, onExportJSON, onImportJSON,
}: Props) {
  const importRef = useRef<HTMLInputElement>(null);
  const { originalSalary: S, minimumWage: M } = config;

  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const input = getMonthlyInput(year, month);
      const result = calculateMonthlyPay(config, input);
      return { month, name: MONTH_NAMES[i], input, result };
    });
  }, [config, year, getMonthlyInput]);

  const chartData = monthlyData.map(({ name, result }) => ({
    name,
    实发: parseFloat(result.total.toFixed(2)),
    原月薪: S,
  }));

  const yearTotal = monthlyData.reduce((sum, { result }) => sum + result.total, 0);
  const originalYearTotal = S * 12;
  const diff = yearTotal - originalYearTotal;
  const diffPct = ((diff / originalYearTotal) * 100).toFixed(1);

  const handleExportCSV = () => {
    const headers = ['月份', '缺勤(天)', '平日加班(h)', '周末加班(h)', '节假日加班(h)', '基础工资', '岗位津贴', '平日加班费', '周末加班费', '节假日加班费', '本月实发'];
    const rows = monthlyData.map(({ name, input, result }) => [
      name,
      input.absentDays,
      input.weekdayOvertimeHours,
      input.weekendOvertimeHours,
      input.holidayOvertimeHours,
      result.basePay.toFixed(2),
      result.allowance.toFixed(2),
      result.weekdayOvertime.toFixed(2),
      result.weekendOvertime.toFixed(2),
      result.holidayOvertime.toFixed(2),
      result.total.toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `salary-${year}.csv`);
  };

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const wsData = [
      ['月份', '缺勤(天)', '平日加班(h)', '周末加班(h)', '节假日加班(h)', '基础工资', '岗位津贴', '平日加班费', '周末加班费', '节假日加班费', '本月实发'],
      ...monthlyData.map(({ name, input, result }) => [
        name,
        input.absentDays,
        input.weekdayOvertimeHours,
        input.weekendOvertimeHours,
        input.holidayOvertimeHours,
        +result.basePay.toFixed(2),
        +result.allowance.toFixed(2),
        +result.weekdayOvertime.toFixed(2),
        +result.weekendOvertime.toFixed(2),
        +result.holidayOvertime.toFixed(2),
        +result.total.toFixed(2),
      ]),
      ['合计', '', '', '', '', '', '', '', '', '', +yearTotal.toFixed(2)],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), `${year}年度汇总`);

    const configData = [
      ['参数', '值'],
      ['原月薪 S', config.originalSalary],
      ['最低工资 M', config.minimumWage],
      ['底薪 B', config.baseSalary],
      ['岗位津贴 A', config.originalSalary - config.baseSalary],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(configData), '参数设置');

    XLSX.writeFile(wb, `salary-${year}.xlsx`);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">4</span>
          年度汇总 · {year}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="text-xs px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
          >
            导出 Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="text-xs px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
          >
            导出 CSV
          </button>
          <button
            onClick={onExportJSON}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            备份 JSON
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            恢复 JSON
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={onImportJSON} />
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">年度实发总额</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(yearTotal)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">原年薪基准（S×12）</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(originalYearTotal)}</div>
        </div>
        <div className={`rounded-lg p-3 col-span-2 sm:col-span-1 ${diff >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-xs text-gray-500 mb-1">与原年薪差额</div>
          <div className={`text-lg font-bold tabular-nums ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
          </div>
          <div className={`text-xs mt-0.5 tabular-nums ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {diff >= 0 ? '+' : ''}{diffPct}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">月度实发 vs 原月薪</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={v => `¥${(v / 1000).toFixed(1)}k`}
              width={52}
            />
            <Tooltip
              formatter={(value) => [typeof value === 'number' ? formatCurrency(value) : String(value)]}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="实发"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="原月薪"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly detail table */}
      <div>
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">12 个月明细</h3>
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-xs min-w-[580px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 text-gray-500 font-medium">月份</th>
                <th className="text-right px-3 py-2 text-gray-500 font-medium">缺勤(天)</th>
                <th className="text-right px-3 py-2 text-gray-500 font-medium">加班(h)</th>
                <th className="text-right px-3 py-2 text-gray-500 font-medium">基础工资</th>
                <th className="text-right px-3 py-2 text-gray-500 font-medium">岗位津贴</th>
                <th className="text-right px-3 py-2 text-gray-500 font-medium">加班费</th>
                <th className="text-right px-3 py-2 text-gray-500 font-semibold text-gray-700">实发</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(({ name, input, result }, i) => {
                const totalOvertime = result.weekdayOvertime + result.weekendOvertime + result.holidayOvertime;
                const totalOvertimeHours = input.weekdayOvertimeHours + input.weekendOvertimeHours + input.holidayOvertimeHours;
                const isLow = result.total < M * 0.8;
                return (
                  <tr key={i} className={`border-b border-gray-100 ${isLow ? 'bg-red-50' : i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-3 py-2 text-gray-800 font-medium">{name}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{input.absentDays || '—'}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{totalOvertimeHours || '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-700">{formatCurrency(result.basePay)}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-700">{formatCurrency(result.allowance)}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-700">{formatCurrency(totalOvertime)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-bold ${isLow ? 'text-red-700' : 'text-gray-900'}`}>
                      {formatCurrency(result.total)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-3 py-2.5 font-semibold text-blue-900" colSpan={6}>全年合计</td>
                <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-900">{formatCurrency(yearTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
