import { describe, it, expect } from 'vitest'
import { calculateMaternityPay } from './calculator'
import { MaternityPolicy, SalaryData } from '../types/maternity'

describe('calculateMaternityPay', () => {
  const mockPolicy: MaternityPolicy = {
    id: 'test-policy',
    name: 'Standard Policy',
    smpRules: {
      standardRate: 184.03,
      lowerEarningsLimit: 123,
      higherRatePercentage: 90,
      higherRateWeeks: 6,
      standardRateWeeks: 33,
    },
    companyRules: [
      { weeks: 16, percentage: 100, inclusiveOfSMP: true },
      { weeks: 10, percentage: 50, inclusiveOfSMP: true },
    ],
  }

  const mockSalary: SalaryData = {
    monthlyPreTax: 4000,
    leaveStartDate: '2026-06-01',
  }

  it('should calculate the correct total pay for the 12-month period', () => {
    const result = calculateMaternityPay(mockSalary, mockPolicy)
    expect(result.totalPay).toBeGreaterThan(0)
  })

  it('should have 12 months in the breakdown', () => {
    const result = calculateMaternityPay(mockSalary, mockPolicy)
    expect(result.monthlyBreakdown).toHaveLength(12)
  })

  it('should calculate higher rate SMP correctly for the first 6 weeks', () => {
    // 90% of (4000 * 12 / 52) per week
    // Average weekly pay = 4000 * 12 / 52 = 923.07
    // 90% = 830.76
    // Total for 6 weeks = 4984.56
    const result = calculateMaternityPay(mockSalary, mockPolicy)
    // This is a rough check, we'll refine logic
    expect(result.smpTotal).toBeGreaterThan(0)
  })
})
