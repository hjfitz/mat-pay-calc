import { describe, expect, it } from 'vitest'
import { calculateMaternityPay } from './calculator'
import type { SalaryData } from '../types/maternity'

describe('calculateMaternityPay', () => {
  const salary: SalaryData = {
    averageMonthlyTakeHomePay: 4333.333333333333,
    averageMonthlyCommittedSpending: 2500,
    leaveStartDate: '2026-06-01',
  }

  it('calculates all 52 leave weeks and 12 display months', () => {
    const result = calculateMaternityPay(salary)

    expect(result.weeklyBreakdown).toHaveLength(52)
    expect(result.monthlyBreakdown).toHaveLength(12)
    expect(result.normalWeeklyTakeHome).toBe(1000)
    expect(result.normalMonthlyTakeHome).toBeCloseTo(4333.33, 2)
  })

  it('applies the enhanced pay tiers by elapsed week', () => {
    const result = calculateMaternityPay(salary)

    expect(result.weeklyBreakdown[0].rate).toBe(1)
    expect(result.weeklyBreakdown[5].rate).toBe(1)
    expect(result.weeklyBreakdown[6].rate).toBe(0.6)
    expect(result.weeklyBreakdown[25].rate).toBe(0.6)
    expect(result.weeklyBreakdown[26].rate).toBe(0.5)
    expect(result.weeklyBreakdown[38].rate).toBe(0.5)
    expect(result.weeklyBreakdown[39].rate).toBe(0.4)
    expect(result.weeklyBreakdown[51].rate).toBe(0.4)
  })

  it('uses the SMP floor only when enhanced pay is lower in weeks 7 to 39', () => {
    const lowSalary = calculateMaternityPay({
      averageMonthlyTakeHomePay: 1000,
      averageMonthlyCommittedSpending: 900,
      leaveStartDate: '2026-06-01',
    })

    expect(lowSalary.weeklyBreakdown[5].takeHomeAmount).toBeCloseTo(230.77, 2)
    expect(lowSalary.weeklyBreakdown[6].takeHomeAmount).toBe(187.18)
    expect(lowSalary.weeklyBreakdown[38].takeHomeAmount).toBe(187.18)
    expect(lowSalary.weeklyBreakdown[39].takeHomeAmount).toBeCloseTo(92.31, 2)
    expect(lowSalary.smpFloorTotal).toBeGreaterThan(0)
  })

  it('does not make full salaried months higher because they contain more week starts', () => {
    const result = calculateMaternityPay(salary)
    const august = result.monthlyBreakdown.find((month) => month.month === 'August 2026')
    const september = result.monthlyBreakdown.find((month) => month.month === 'September 2026')
    const october = result.monthlyBreakdown.find((month) => month.month === 'October 2026')

    expect(august?.takeHomeAmount).toBeCloseTo(2600, 2)
    expect(september?.takeHomeAmount).toBeCloseTo(2600, 2)
    expect(october?.takeHomeAmount).toBeCloseTo(2600, 2)
  })

  it('totals the salaried monthly breakdown for a salary above the SMP floor', () => {
    const result = calculateMaternityPay(salary)
    const monthlyTotal = result.monthlyBreakdown.reduce((acc, month) => acc + month.takeHomeAmount, 0)

    expect(result.totalPay).toBeCloseTo(monthlyTotal, 2)
    expect(result.smpFloorTotal).toBe(0)
    expect(result.enhancedPayTotal).toBe(result.totalPay)
  })

  it('calculates money left over and total shortfall against monthly commitments', () => {
    const result = calculateMaternityPay({
      averageMonthlyTakeHomePay: 3000,
      averageMonthlyCommittedSpending: 2500,
      leaveStartDate: '2026-06-01',
    })
    const fullSixtyPercentMonth = result.monthlyBreakdown.find(
      (month) => month.month === 'August 2026',
    )

    expect(fullSixtyPercentMonth?.takeHomeAmount).toBeCloseTo(1800, 2)
    expect(fullSixtyPercentMonth?.moneyLeftOver).toBeCloseTo(-700, 2)
    expect(fullSixtyPercentMonth?.shortfallAmount).toBeCloseTo(700, 2)
    expect(result.totalShortfall).toBeGreaterThan(0)
  })
})
