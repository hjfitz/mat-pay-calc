import { addWeeks, format, startOfMonth, isSameMonth, parseISO, addMonths } from 'date-fns'
import { MaternityPolicy, SalaryData, CalculationResult, MonthlyPayment } from '../types/maternity'

export function calculateMaternityPay(
  salary: SalaryData,
  policy: MaternityPolicy
): CalculationResult {
  const startDate = parseISO(salary.leaveStartDate)
  const avgWeeklyPay = (salary.monthlyPreTax * 12) / 52

  const weeklyBreakdown: { date: Date; smp: number; company: number }[] = []

  for (let week = 0; week < 52; week++) {
    const currentDate = addWeeks(startDate, week)
    let smp = 0
    let company = 0

    // SMP Logic
    if (week < policy.smpRules.higherRateWeeks) {
      smp = avgWeeklyPay * (policy.smpRules.higherRatePercentage / 100)
    } else if (week < policy.smpRules.higherRateWeeks + policy.smpRules.standardRateWeeks) {
      smp = Math.min(avgWeeklyPay * (policy.smpRules.higherRatePercentage / 100), policy.smpRules.standardRate)
    }

    // Company Logic
    let cumulativeWeeks = 0
    for (const rule of policy.companyRules) {
      if (week >= cumulativeWeeks && week < cumulativeWeeks + rule.weeks) {
        const fullCompanyPay = avgWeeklyPay * (rule.percentage / 100)
        if (rule.inclusiveOfSMP) {
          company = Math.max(0, fullCompanyPay - smp)
        } else {
          company = fullCompanyPay
        }
        break
      }
      cumulativeWeeks += rule.weeks
    }

    weeklyBreakdown.push({ date: currentDate, smp, company })
  }

  // Aggregate to Monthly
  const monthlyBreakdown: MonthlyPayment[] = []
  let tempMonth = startOfMonth(startDate)

  for (let i = 0; i < 12; i++) {
    const monthLabel = format(tempMonth, 'MMMM yyyy')
    const paymentsInMonth = weeklyBreakdown.filter((w) => isSameMonth(w.date, tempMonth))

    const smpAmount = paymentsInMonth.reduce((acc, w) => acc + w.smp, 0)
    const companyAmount = paymentsInMonth.reduce((acc, w) => acc + w.company, 0)

    monthlyBreakdown.push({
      month: monthLabel,
      preTaxAmount: smpAmount + companyAmount,
      smpAmount,
      companyAmount,
    })
    
    tempMonth = addMonths(tempMonth, 1)
  }

  const smpTotal = monthlyBreakdown.reduce((acc, m) => acc + m.smpAmount, 0)
  const companyTotal = monthlyBreakdown.reduce((acc, m) => acc + m.companyAmount, 0)

  return {
    monthlyBreakdown,
    totalPay: smpTotal + companyTotal,
    smpTotal,
    companyTotal,
  }
}
