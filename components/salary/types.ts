export interface SalaryConfig {
  originalSalary: number; // S（仅作参考基准）
  minimumWage: number;    // M
  baseSalary: number;     // B
  allowance: number;      // A（手动设置，独立于 B）
}

export interface MonthlyInput {
  absentDays: number;
  weekdayOvertimeHours: number;
  weekendOvertimeHours: number;
  holidayOvertimeHours: number;
}

export interface MonthlyResult {
  basePay: number;
  allowance: number;
  weekdayOvertime: number;
  weekendOvertime: number;
  holidayOvertime: number;
  total: number;
}

export interface SalaryRates {
  positionAllowance: number;
  dailyRate: number;
  hourlyRate: number;
  weekdayOvertimeRate: number;
  weekendOvertimeRate: number;
  holidayOvertimeRate: number;
}

export interface MonthStats {
  workdays: number;
  weekendDays: number;
  holidayCount: number;
}
