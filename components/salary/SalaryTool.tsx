'use client';
import { useState, useEffect } from 'react';
import type { SalaryConfig } from './types';
import type { AnnualInput } from './utils';
import Block1Adjuster from './Block1Adjuster';
import Block3AnnualInput from './Block3AnnualInput';
import Block4Summary from './Block4Summary';

const DEFAULT_CONFIG: SalaryConfig = {
  originalSalary: 4500,
  minimumWage: 2090,
  baseSalary: 2090,
  allowance: 2410,
};

const DEFAULT_ANNUAL_INPUT: AnnualInput = {
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
  const [annualInput, setAnnualInput] = useState<AnnualInput>(() => load('sc:annual-input', DEFAULT_ANNUAL_INPUT));

  useEffect(() => { save('sc:config', config); }, [config]);
  useEffect(() => { save('sc:annual-input', annualInput); }, [annualInput]);

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
        <Block3AnnualInput value={annualInput} onChange={setAnnualInput} />
        <Block4Summary config={config} annualInput={annualInput} />
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-4 text-center text-xs text-gray-400">
        本工具仅供参考，薪资设计请结合当地劳动法规及专业意见。
      </footer>
    </div>
  );
}
