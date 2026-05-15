export interface SalaryData {
  averageMonthlyTakeHomePay: number
  averageMonthlyCommittedSpending: number
  leaveStartDate: string
}

export interface CalculationResult {
  monthlyBreakdown: MonthlyPayment[]
  weeklyBreakdown: WeeklyPayment[]
  totalPay: number
  smpFloorTotal: number
  enhancedPayTotal: number
  totalShortfall: number
  normalWeeklyTakeHome: number
  normalMonthlyTakeHome: number
}

export interface MonthlyPayment {
  month: string
  takeHomeAmount: number
  enhancedAmount: number
  smpFloorAmount: number
  moneyLeftOver: number
  shortfallAmount: number
  leaveDayCount: number
  averageDailyPay: number
  dominantRate: number
  rates: number[]
}

export interface WeeklyPayment {
  weekNumber: number
  weekStartDate: string
  rate: number
  enhancedAmount: number
  smpFloorAmount: number
  takeHomeAmount: number
  smpFloorApplied: boolean
}
