import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns'
import type { CalculationResult, MonthlyPayment, SalaryData, WeeklyPayment } from '../types/maternity'

const TOTAL_LEAVE_WEEKS = 52
const SMP_STANDARD_RATE = 187.18

function getEnhancedPayRate(weekIndex: number): number {
  if (weekIndex < 6) return 1
  if (weekIndex < 26) return 0.6
  if (weekIndex < 39) return 0.5
  return 0.4
}

function getSmpFloor(weekIndex: number): number {
  return weekIndex >= 6 && weekIndex < 39 ? SMP_STANDARD_RATE : 0
}

function getEnhancedPayRateForDay(dayIndex: number): number {
  return getEnhancedPayRate(Math.floor(dayIndex / 7))
}

function getSmpFloorForDay(dayIndex: number): number {
  return getSmpFloor(Math.floor(dayIndex / 7)) / 7
}

function maxDate(first: Date, second: Date): Date {
  return first > second ? first : second
}

function minDate(first: Date, second: Date): Date {
  return first < second ? first : second
}

export function calculateMaternityPay(salary: SalaryData): CalculationResult {
  const startDate = parseISO(salary.leaveStartDate)
  const leaveEndDate = addDays(startDate, TOTAL_LEAVE_WEEKS * 7 - 1)
  const normalWeeklyTakeHome = (salary.averageMonthlyTakeHomePay * 12) / 52
  const normalMonthlyTakeHome = (normalWeeklyTakeHome * 52) / 12

  const weeklyBreakdown: WeeklyPayment[] = []

  for (let week = 0; week < TOTAL_LEAVE_WEEKS; week += 1) {
    const currentDate = addWeeks(startDate, week)
    const rate = getEnhancedPayRate(week)
    const enhancedAmount = normalWeeklyTakeHome * rate
    const smpFloorAmount = getSmpFloor(week)
    const takeHomeAmount = Math.max(enhancedAmount, smpFloorAmount)

    weeklyBreakdown.push({
      weekNumber: week + 1,
      weekStartDate: format(currentDate, 'yyyy-MM-dd'),
      rate,
      enhancedAmount,
      smpFloorAmount,
      takeHomeAmount,
      smpFloorApplied: smpFloorAmount > enhancedAmount,
    })
  }

  const monthlyBreakdown: MonthlyPayment[] = []
  let tempMonth = startOfMonth(startDate)

  for (let i = 0; i < 12; i += 1) {
    const monthLabel = format(tempMonth, 'MMMM yyyy')
    const monthEnd = endOfMonth(tempMonth)
    const leavePeriodStart = maxDate(tempMonth, startDate)
    const leavePeriodEnd = minDate(monthEnd, leaveEndDate)
    const daysInMonth = differenceInCalendarDays(addDays(monthEnd, 1), tempMonth)
    const dailyTakeHome = salary.averageMonthlyTakeHomePay / daysInMonth
    let takeHomeAmount = 0
    let enhancedAmount = 0
    let smpFloorAmount = 0
    let leaveDayCount = 0
    const rateTotals: Record<number, number> = {}

    if (leavePeriodStart <= leavePeriodEnd) {
      for (
        let currentDate = leavePeriodStart;
        currentDate <= leavePeriodEnd;
        currentDate = addDays(currentDate, 1)
      ) {
        const elapsedDay = differenceInCalendarDays(currentDate, startDate)
        const rate = getEnhancedPayRateForDay(elapsedDay)
        const enhancedDailyAmount = dailyTakeHome * rate
        const smpDailyFloor = getSmpFloorForDay(elapsedDay)

        takeHomeAmount += Math.max(enhancedDailyAmount, smpDailyFloor)
        enhancedAmount += enhancedDailyAmount
        smpFloorAmount += smpDailyFloor > enhancedDailyAmount ? smpDailyFloor : 0
        leaveDayCount += 1
        rateTotals[rate] = (rateTotals[rate] ?? 0) + 1
      }
    }

    const rates = Object.keys(rateTotals)
      .map(Number)
      .sort((a, b) => b - a)
    const dominantRate = Number(
      Object.entries(rateTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 0,
    )

    monthlyBreakdown.push({
      month: monthLabel,
      takeHomeAmount,
      enhancedAmount,
      smpFloorAmount,
      moneyLeftOver: takeHomeAmount - salary.averageMonthlyCommittedSpending,
      shortfallAmount: Math.max(0, salary.averageMonthlyCommittedSpending - takeHomeAmount),
      leaveDayCount,
      averageDailyPay: leaveDayCount > 0 ? takeHomeAmount / leaveDayCount : 0,
      dominantRate,
      rates,
    })

    tempMonth = addMonths(tempMonth, 1)
  }

  const totalPay = monthlyBreakdown.reduce((acc, month) => acc + month.takeHomeAmount, 0)
  const enhancedPayTotal = monthlyBreakdown.reduce((acc, month) => acc + month.enhancedAmount, 0)
  const smpFloorTotal = monthlyBreakdown.reduce((acc, month) => {
    return acc + (month.takeHomeAmount - month.enhancedAmount)
  }, 0)
  const totalShortfall = monthlyBreakdown.reduce((acc, month) => acc + month.shortfallAmount, 0)

  return {
    monthlyBreakdown,
    weeklyBreakdown,
    totalPay,
    smpFloorTotal,
    enhancedPayTotal,
    totalShortfall,
    normalWeeklyTakeHome,
    normalMonthlyTakeHome,
  }
}
