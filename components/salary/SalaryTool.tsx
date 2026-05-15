'use client';
import { useState, useEffect, useCallback } from 'react';
import type { SalaryConfig, MonthlyInput } from './types';
import { DEFAULT_HOLIDAYS_2026, DEFAULT_WORKDAY_OVERRIDES_2026 } from './constants';
import { formatMonthKey } from './utils';
import Block1Adjuster from './Block1Adjuster';
import Block2Calendar from './Block2Calendar';
import Block3Calculator from './Block3Calculator';
import Block4Summary from './Block4Summary';

const DEFAULT_CONFIG: SalaryConfig = {
  originalSalary: 4500,
  minimumWage: 2090,
  baseSalary: 2090,
};

const DEFAULT_MONTHLY_INPUT: MonthlyInput = {
  absentDays: 0,
  weekdayOvertimeHours: 0,
  weekendOvertimeHours: 0,
  holidayOvertimeHours: 0,
};

function load<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function SalaryTool() {
  const [config, setConfig] = useState<SalaryConfig>(() => load('sc:config', DEFAULT_CONFIG));
  const [holidays, setHolidays] = useState<string[]>(() => load('sc:holidays', DEFAULT_HOLIDAYS_2026));
  const [workdayOverrides, setWorkdayOverrides] = useState<string[]>(() =>
    load('sc:overrides', DEFAULT_WORKDAY_OVERRIDES_2026)
  );
  const [monthlyInputs, setMonthlyInputs] = useState<Record<string, MonthlyInput>>(() =>
    load('sc:monthly', {})
  );
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => { save('sc:config', config); }, [config]);
  useEffect(() => { save('sc:holidays', holidays); }, [holidays]);
  useEffect(() => { save('sc:overrides', workdayOverrides); }, [workdayOverrides]);
  useEffect(() => { save('sc:monthly', monthlyInputs); }, [monthlyInputs]);

  const getMonthlyInput = useCallback((year: number, month: number): MonthlyInput => {
    return monthlyInputs[formatMonthKey(year, month)] ?? DEFAULT_MONTHLY_INPUT;
  }, [monthlyInputs]);

  const setMonthlyInput = useCallback((year: number, month: number, input: MonthlyInput) => {
    setMonthlyInputs(prev => ({ ...prev, [formatMonthKey(year, month)]: input }));
  }, []);

  const handleExportJSON = () => {
    const data = { config, holidays, workdayOverrides, monthlyInputs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.config) setConfig(data.config);
        if (data.holidays) setHolidays(data.holidays);
        if (data.workdayOverrides) setWorkdayOverrides(data.workdayOverrides);
        if (data.monthlyInputs) setMonthlyInputs(data.monthlyInputs);
      } catch {
        alert('JSON 文件格式错误，无法导入');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              HR 工具
            </div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">工资结构改造工具</h1>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block text-right">
            底薪 + 岗位津贴 + 加班费
            <br />
            <span className="text-gray-300">数据自动保存至本地</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 md:px-8 space-y-5 pb-12">
        <Block1Adjuster config={config} onConfigChange={setConfig} />
        <Block2Calendar
          year={selectedYear}
          onYearChange={setSelectedYear}
          holidays={holidays}
          onHolidaysChange={setHolidays}
          workdayOverrides={workdayOverrides}
          onWorkdayOverridesChange={setWorkdayOverrides}
        />
        <Block3Calculator
          config={config}
          year={selectedYear}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          holidays={holidays}
          workdayOverrides={workdayOverrides}
          monthlyInput={getMonthlyInput(selectedYear, selectedMonth)}
          onMonthlyInputChange={input => setMonthlyInput(selectedYear, selectedMonth, input)}
        />
        <Block4Summary
          config={config}
          year={selectedYear}
          monthlyInputs={monthlyInputs}
          getMonthlyInput={getMonthlyInput}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
        />
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-4 text-center text-xs text-gray-400">
        本工具仅供参考，薪资设计请结合当地劳动法规及专业意见。
      </footer>
    </div>
  );
}
