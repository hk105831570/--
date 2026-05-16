'use client';
import { useState, useEffect } from 'react';
import type { SalaryConfig } from './types';
import { calculateRates, formatCurrency, STANDARD_DAYS } from './utils';

interface Props {
  config: SalaryConfig;
  onConfigChange: (config: SalaryConfig) => void;
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-base font-semibold text-gray-900 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Block1Adjuster({ config, onConfigChange }: Props) {
  const [sInput, setSInput] = useState(String(config.originalSalary));
  const [mInput, setMInput] = useState(String(config.minimumWage));
  const [bInput, setBInput] = useState(String(config.baseSalary));
  const [aInput, setAInput] = useState(String(config.allowance));

  const { originalSalary: S, minimumWage: M, baseSalary: B, allowance: A } = config;
  const rates = calculateRates(config);
  const safetyMargin = B - M;
  const safetyPercent = M > 0 ? ((safetyMargin / M) * 100).toFixed(1) : '0.0';
  const isAtMin = Math.abs(B - M) < 0.01;
  const isBelowMin = B < M - 0.01;

  const clampedUpdate = (updates: Partial<SalaryConfig>) => {
    const next = { ...config, ...updates };
    if (next.baseSalary < next.minimumWage) next.baseSalary = next.minimumWage;
    if (next.baseSalary > next.originalSalary) next.baseSalary = next.originalSalary;
    onConfigChange(next);
  };

  const handleSBlur = () => {
    const v = parseFloat(sInput);
    if (!isNaN(v) && v > 0) {
      const newS = Math.max(v, M);
      setSInput(String(newS));
      clampedUpdate({ originalSalary: newS, baseSalary: Math.min(B, newS) });
    } else {
      setSInput(String(S));
    }
  };

  const handleMBlur = () => {
    const v = parseFloat(mInput);
    if (!isNaN(v) && v > 0) {
      setMInput(String(v));
      clampedUpdate({ minimumWage: v, baseSalary: Math.max(B, v) });
    } else {
      setMInput(String(M));
    }
  };

  const handleBChange = (val: string) => {
    setBInput(val);
    const v = parseFloat(val);
    if (!isNaN(v)) {
      const clamped = Math.max(M, Math.min(S, v));
      onConfigChange({ ...config, baseSalary: clamped });
    }
  };

  const handleBBlur = () => {
    const v = parseFloat(bInput);
    if (!isNaN(v)) {
      const clamped = Math.max(M, Math.min(S, v));
      setBInput(String(clamped));
      onConfigChange({ ...config, baseSalary: clamped });
    } else {
      setBInput(String(B));
    }
  };

  const handleAChange = (val: string) => {
    setAInput(val);
    const v = parseFloat(val);
    if (!isNaN(v) && v >= 0) {
      onConfigChange({ ...config, allowance: v });
    }
  };

  const handleABlur = () => {
    const v = parseFloat(aInput);
    if (!isNaN(v) && v >= 0) {
      onConfigChange({ ...config, allowance: v });
    } else {
      setAInput(String(A));
    }
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setBInput(String(v));
    onConfigChange({ ...config, baseSalary: v });
  };

  useEffect(() => { setSInput(String(config.originalSalary)); }, [config.originalSalary]);
  useEffect(() => { setMInput(String(config.minimumWage)); }, [config.minimumWage]);
  useEffect(() => { setBInput(String(config.baseSalary)); }, [config.baseSalary]);
  useEffect(() => { setAInput(String(config.allowance)); }, [config.allowance]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
        薪资结构设置
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">原月薪 S（元）</label>
          <input
            type="number"
            value={sInput}
            onChange={e => setSInput(e.target.value)}
            onBlur={handleSBlur}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">最低工资标准 M（元）</label>
          <input
            type="number"
            value={mInput}
            onChange={e => setMInput(e.target.value)}
            onBlur={handleMBlur}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* B slider + A input */}
      <div className="mb-5 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500">底薪 B（元）</label>
            <input
              type="number"
              value={bInput}
              onChange={e => handleBChange(e.target.value)}
              onBlur={handleBBlur}
              min={M}
              max={S}
              className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 shrink-0 w-20 text-right">{formatCurrency(M)}</span>
            <input
              type="range"
              min={M}
              max={S}
              step={10}
              value={B}
              onChange={handleSlider}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs text-gray-400 shrink-0 w-20">{formatCurrency(S)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-500">岗位津贴 A（元）</label>
          <input
            type="number"
            value={aInput}
            onChange={e => handleAChange(e.target.value)}
            onBlur={handleABlur}
            min={0}
            className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isBelowMin && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium">
          底薪低于最低工资标准，不合规，已自动锁定至最低值。
        </div>
      )}
      {isAtMin && !isBelowMin && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          底薪贴线，缺勤扣款空间受限（底薪等于最低工资标准）
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoCard
          label="底薪 B"
          value={formatCurrency(B)}
          sub={`占原月薪 ${S > 0 ? ((B / S) * 100).toFixed(1) : '0'}%`}
        />
        <InfoCard
          label="岗位津贴 A"
          value={formatCurrency(A)}
          sub={`占原月薪 ${S > 0 ? ((A / S) * 100).toFixed(1) : '0'}%`}
        />
        <InfoCard
          label="安全垫（超最低工资）"
          value={formatCurrency(safetyMargin)}
          sub={`+${safetyPercent}%`}
        />
        <InfoCard
          label="日工资"
          value={formatCurrency(rates.dailyRate)}
          sub={`B ÷ ${STANDARD_DAYS}`}
        />
        <InfoCard
          label="时工资"
          value={formatCurrency(rates.hourlyRate)}
          sub="日工资 ÷ 8"
        />
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-2">加班单价（元/时）</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">平日 ×1.5</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(rates.weekdayOvertimeRate)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">周末 ×2</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(rates.weekendOvertimeRate)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">节假日 ×3</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(rates.holidayOvertimeRate)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
