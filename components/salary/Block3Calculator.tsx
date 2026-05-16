'use client';
import { MONTH_NAMES } from './constants';
import { calculateMonthlyPay, calculateRates, getMonthStats, formatCurrency, STANDARD_DAYS } from './utils';
import type { SalaryConfig, MonthlyInput } from './types';

interface Props {
  config: SalaryConfig;
  year: number;
  month: number;
  onMonthChange: (month: number) => void;
  holidays: string[];
  workdayOverrides: string[];
  monthlyInput: MonthlyInput;
  onMonthlyInputChange: (input: MonthlyInput) => void;
}

function NumInput({
  label, value, onChange, max, step = 0.5, hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        min={0}
        max={max}
        step={step}
        onChange={e => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && v >= 0) {
            onChange(max !== undefined ? Math.min(v, max) : v);
          } else if (e.target.value === '' || e.target.value === '0') {
            onChange(0);
          }
        }}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function Block3Calculator({
  config, year, month, onMonthChange, holidays, workdayOverrides, monthlyInput, onMonthlyInputChange,
}: Props) {
  const stats = getMonthStats(year, month, holidays, workdayOverrides);
  const rates = calculateRates(config);
  const result = calculateMonthlyPay(config, monthlyInput);
  const { baseSalary: B, originalSalary: S, minimumWage: M } = config;
  const A = S - B;

  const lowIncomeThreshold = M * 0.8;
  const isLowIncome = result.total < lowIncomeThreshold;
  const diff = result.total - S;

  const rows = [
    {
      label: '基础工资',
      formula: `${formatCurrency(B)} × (1 − ${monthlyInput.absentDays}/${STANDARD_DAYS})`,
      amount: result.basePay,
    },
    {
      label: '岗位津贴',
      formula: `${formatCurrency(A)} × (1 − ${monthlyInput.absentDays}/${STANDARD_DAYS})`,
      amount: result.allowance,
    },
    {
      label: '平日加班费',
      formula: `${formatCurrency(rates.hourlyRate)} × 1.5 × ${monthlyInput.weekdayOvertimeHours}h`,
      amount: result.weekdayOvertime,
    },
    {
      label: '周末加班费',
      formula: `${formatCurrency(rates.hourlyRate)} × 2 × ${monthlyInput.weekendOvertimeHours}h`,
      amount: result.weekendOvertime,
    },
    {
      label: '节假日加班费',
      formula: `${formatCurrency(rates.hourlyRate)} × 3 × ${monthlyInput.holidayOvertimeHours}h`,
      amount: result.holidayOvertime,
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
        月度工资计算器
      </h2>

      {isLowIncome && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          本月实发 {formatCurrency(result.total)} 低于最低工资 80%（{formatCurrency(lowIncomeThreshold)}），存在合规风险！
        </div>
      )}

      {/* Month selector + stats */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">月份</label>
          <select
            value={month}
            onChange={e => onMonthChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{year}年 {name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-sm mt-auto pb-0.5 ml-2">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.workdays}</div>
            <div className="text-xs text-gray-500">工作日</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{stats.weekendDays}</div>
            <div className="text-xs text-gray-500">周末</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{stats.holidayCount}</div>
            <div className="text-xs text-gray-500">节假日</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">考勤数据</h3>
          <NumInput
            label="缺勤天数"
            value={monthlyInput.absentDays}
            max={STANDARD_DAYS}
            step={0.5}
            hint="节假日不计入缺勤"
            onChange={v => onMonthlyInputChange({ ...monthlyInput, absentDays: v })}
          />
          <NumInput
            label="平日加班小时数"
            value={monthlyInput.weekdayOvertimeHours}
            step={0.5}
            hint="日标准 8h 内超出部分"
            onChange={v => onMonthlyInputChange({ ...monthlyInput, weekdayOvertimeHours: v })}
          />
          <NumInput
            label="周末加班小时数"
            value={monthlyInput.weekendOvertimeHours}
            step={0.5}
            hint="周六/周日上班（整天按 8h 计）"
            onChange={v => onMonthlyInputChange({ ...monthlyInput, weekendOvertimeHours: v })}
          />
          <NumInput
            label="节假日加班小时数"
            value={monthlyInput.holidayOvertimeHours}
            step={0.5}
            hint="法定节假日上班"
            onChange={v => onMonthlyInputChange({ ...monthlyInput, holidayOvertimeHours: v })}
          />
        </div>

        {/* Results */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">工资明细</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">项目</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium hidden sm:table-cell">计算式</th>
                  <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">金额</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2.5 text-gray-700 text-sm">{row.label}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs hidden sm:table-cell leading-tight">{row.formula}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-gray-900 text-sm">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td className="px-3 py-3 font-semibold text-blue-900" colSpan={1}>本月实发</td>
                  <td className="hidden sm:table-cell" />
                  <td className="px-3 py-3 text-right font-bold font-mono text-blue-900 text-base">{formatCurrency(result.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>原月薪基准</span>
              <span className="font-mono">{formatCurrency(S)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">差额</span>
              <span className={`font-mono font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
