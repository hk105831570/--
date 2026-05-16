'use client';
import { useState } from 'react';
import { MONTH_NAMES, WEEKDAY_NAMES_SHORT } from './constants';
import { toDateString, getMonthStats } from './utils';

interface Props {
  year: number;
  onYearChange: (year: number) => void;
  holidays: string[];
  onHolidaysChange: (holidays: string[]) => void;
  workdayOverrides: string[];
  onWorkdayOverridesChange: (overrides: string[]) => void;
}

type EditMode = 'holiday' | 'workday';

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month - 1, d));
  }
  return cells;
}

export default function Block2Calendar({
  year, onYearChange, holidays, onHolidaysChange, workdayOverrides, onWorkdayOverridesChange,
}: Props) {
  const [editMode, setEditMode] = useState<EditMode>('holiday');

  const toggleDate = (dateStr: string, date: Date) => {
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;

    if (editMode === 'holiday') {
      if (holidays.includes(dateStr)) {
        onHolidaysChange(holidays.filter(d => d !== dateStr));
      } else {
        onHolidaysChange([...holidays, dateStr].sort());
        if (workdayOverrides.includes(dateStr)) {
          onWorkdayOverridesChange(workdayOverrides.filter(d => d !== dateStr));
        }
      }
    } else {
      if (!isWeekend) return;
      if (workdayOverrides.includes(dateStr)) {
        onWorkdayOverridesChange(workdayOverrides.filter(d => d !== dateStr));
      } else {
        onWorkdayOverridesChange([...workdayOverrides, dateStr].sort());
        if (holidays.includes(dateStr)) {
          onHolidaysChange(holidays.filter(d => d !== dateStr));
        }
      }
    }
  };

  const yearHolidayCount = holidays.filter(d => d.startsWith(String(year))).length;
  const yearStats = Array.from({ length: 12 }, (_, i) =>
    getMonthStats(year, i + 1, holidays, workdayOverrides)
  );
  const yearWorkdays = yearStats.reduce((s, m) => s + m.workdays, 0);
  const yearWeekendDays = yearStats.reduce((s, m) => s + m.weekendDays, 0);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
        节假日日历
      </h2>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onYearChange(year - 1)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-900 w-10 text-center">{year}</span>
          <button
            onClick={() => onYearChange(year + 1)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          >
            ›
          </button>
        </div>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            onClick={() => setEditMode('holiday')}
            className={`px-3 py-1.5 transition-colors ${editMode === 'holiday' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            标记节假日
          </button>
          <button
            onClick={() => setEditMode('workday')}
            className={`px-3 py-1.5 transition-colors ${editMode === 'workday' ? 'bg-orange-400 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            标记调休补班
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
            节假日
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-100 border border-orange-300 inline-block" />
            调休补班
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200 inline-block" />
            周末
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        {editMode === 'holiday' ? '点击任意日期 → 切换节假日' : '点击周末日期 → 切换调休补班（当天作为工作日上班）'}
      </p>

      {/* 12-month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const stats = getMonthStats(year, month, holidays, workdayOverrides);
          const cells = buildMonthGrid(year, month);

          return (
            <div key={month} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{MONTH_NAMES[i]}</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-600">{stats.workdays}工</span>
                  <span className="text-blue-500">{stats.weekendDays}休</span>
                  <span className="text-red-500">{stats.holidayCount}假</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px mb-1">
                {WEEKDAY_NAMES_SHORT.map(d => (
                  <div key={d} className="text-center text-[10px] text-gray-400 py-0.5">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px">
                {cells.map((date, idx) => {
                  if (!date) return <div key={`e${idx}`} />;

                  const dateStr = toDateString(date);
                  const dow = date.getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  const isHoliday = holidays.includes(dateStr);
                  const isOverride = workdayOverrides.includes(dateStr);
                  const isClickable = editMode === 'holiday' || isWeekend;

                  let cls = 'text-center text-[11px] py-0.5 rounded cursor-pointer select-none transition-colors ';
                  if (isHoliday) {
                    cls += 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200';
                  } else if (isOverride) {
                    cls += 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200';
                  } else if (isWeekend) {
                    cls += 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100';
                  } else {
                    cls += 'text-gray-700 hover:bg-gray-100';
                  }
                  if (!isClickable) cls += ' cursor-default opacity-50';

                  return (
                    <button
                      key={dateStr}
                      onClick={() => isClickable && toggleDate(dateStr, date)}
                      className={cls}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Year summary */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xl font-bold text-gray-900">{yearWorkdays}</div>
          <div className="text-xs text-gray-500 mt-0.5">年度工作日</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-700">{yearWeekendDays}</div>
          <div className="text-xs text-gray-500 mt-0.5">年度周末天数</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-xl font-bold text-red-600">{yearHolidayCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">法定节假日</div>
        </div>
      </div>
    </section>
  );
}
