'use client';
import { useMemo } from 'react';
import { calculateAnnualSalary, formatCurrency } from './utils';
import type { AnnualInput } from './utils';
import type { SalaryConfig } from './types';

interface Props {
  config: SalaryConfig;
  annualInput: AnnualInput;
}

export default function Block4Summary({ config, annualInput }: Props) {
  const result = useMemo(() => {
    return calculateAnnualSalary(config, annualInput);
  }, [config, annualInput]);

  const diff = result.annualTotal - config.originalSalary * 12;
  const diffPct = ((diff / (config.originalSalary * 12)) * 100).toFixed(1);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
        年度工资汇总
      </h2>

      <div className="space-y-3">
        {/* 基础工资 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-700 font-medium">基础工资</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(config.baseSalary)} × 12 个月</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(result.baseSalaryAnnual)}</div>
          </div>
        </div>

        {/* 岗位津贴 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-700 font-medium">岗位津贴</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(config.allowance)} × 12 个月</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(result.allowanceAnnual)}</div>
          </div>
        </div>

        {/* 加班费 */}
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div>
            <div className="text-sm text-blue-900 font-medium">全年加班费</div>
            <div className="text-xs text-blue-700 mt-0.5">
              平日 + 周末 + 节假日
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-700 tabular-nums">{formatCurrency(result.totalOvertimeAnnual)}</div>
          </div>
        </div>

        {/* 分项加班费 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-500 mb-1">平日加班</div>
            <div className="font-semibold text-gray-900">{formatCurrency(result.weekdayOvertimeAnnual)}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-500 mb-1">周末加班</div>
            <div className="font-semibold text-gray-900">{formatCurrency(result.weekendOvertimeAnnual)}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-500 mb-1">节假日加班</div>
            <div className="font-semibold text-gray-900">{formatCurrency(result.holidayOvertimeAnnual)}</div>
          </div>
        </div>

        {/* 年度实发（关键数字） */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <div>
            <div className="text-base font-semibold text-blue-900">年度实发工资</div>
            <div className="text-xs text-blue-700 mt-1">基础 + 津贴 + 加班费</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900 tabular-nums">{formatCurrency(result.annualTotal)}</div>
            <div className="text-sm text-blue-700 mt-1">月均 {formatCurrency(result.monthlyAverage)}</div>
          </div>
        </div>

        {/* 与原年薪对比 */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 pt-4">
          <div>
            <div className="text-sm text-gray-700">原年薪基准</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(config.originalSalary)} × 12</div>
          </div>
          <div className="text-right">
            <div className="text-lg text-gray-600 tabular-nums">{formatCurrency(config.originalSalary * 12)}</div>
          </div>
        </div>

        {/* 差额 */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${diff >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div>
            <div className={`text-sm font-medium ${diff >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              年度差额
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold tabular-nums ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
            </div>
            <div className={`text-xs mt-1 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {diff >= 0 ? '+' : ''}{diffPct}%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
