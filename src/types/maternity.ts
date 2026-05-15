export interface MaternityPolicy {
  id: string;
  name: string;
  smpRules: SMPRules;
  companyRules: CompanyRules[];
}

export interface SMPRules {
  standardRate: number; // e.g., 184.03
  lowerEarningsLimit: number; // e.g., 123
  higherRatePercentage: number; // e.g., 90
  higherRateWeeks: number; // e.g., 6
  standardRateWeeks: number; // e.g., 33
}

export interface CompanyRules {
  weeks: number;
  percentage: number; // 0 to 100
  inclusiveOfSMP: boolean;
}

export interface SalaryData {
  monthlyPreTax: number;
  leaveStartDate: string; // ISO date
}

export interface CalculationResult {
  monthlyBreakdown: MonthlyPayment[];
  totalPay: number;
  smpTotal: number;
  companyTotal: number;
}

export interface MonthlyPayment {
  month: string; // e.g., "January 2026"
  preTaxAmount: number;
  smpAmount: number;
  companyAmount: number;
}
