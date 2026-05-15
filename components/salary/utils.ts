import type { SalaryConfig, SalaryRates, MonthlyInput, MonthlyResult, MonthStats } from './types';

export const STANDARD_DAYS = 21.75;

export function calculateRates(config: SalaryConfig): SalaryRates {
  const B = config.baseSalary;
  const A = config.originalSalary - B;
  const dailyRate = B / STANDARD_DAYS;
  const hourlyRate = dailyRate / 8;
  return {
    positionAllowance: A,
    dailyRate,
    hourlyRate,
    weekdayOvertimeRate: hourlyRate * 1.5,
    weekendOvertimeRate: hourlyRate * 2,
    holidayOvertimeRate: hourlyRate * 3,
  };
}

export function calculateMonthlyPay(config: SalaryConfig, input: MonthlyInput): MonthlyResult {
  const rates = calculateRates(config);
  const B = config.baseSalary;
  const A = config.originalSalary - B;
  const deductRatio = Math.min(input.absentDays / STANDARD_DAYS, 1);
  const basePay = B * (1 - deductRatio);
  const allowance = A * (1 - deductRatio);
  const weekdayOvertime = rates.hourlyRate * 1.5 * input.weekdayOvertimeHours;
  const weekendOvertime = rates.hourlyRate * 2 * input.weekendOvertimeHours;
  const holidayOvertime = rates.hourlyRate * 3 * input.holidayOvertimeHours;
  const total = basePay + allowance + weekdayOvertime + weekendOvertime + holidayOvertime;
  return { basePay, allowance, weekdayOvertime, weekendOvertime, holidayOvertime, total };
}

export function getMonthStats(
  year: number,
  month: number,
  holidays: string[],
  workdayOverrides: string[],
): MonthStats {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workdays = 0;
  let weekendDays = 0;
  let holidayCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = toDateString(date);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidays.includes(dateStr);
    const isOverride = workdayOverrides.includes(dateStr);

    if (isHoliday) {
      holidayCount++;
    } else if (isWeekend && !isOverride) {
      weekendDays++;
    } else {
      workdays++;
    }
  }
  return { workdays, weekendDays, holidayCount };
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatCurrency(value: number): string {
  return '¥' + value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}
