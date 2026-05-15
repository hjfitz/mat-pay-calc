import { beforeEach, describe, expect, it } from 'vitest'
import { useMaternityStore } from './useMaternityStore'

describe('useMaternityStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useMaternityStore.setState({
      salaryData: {
        averageMonthlyTakeHomePay: 0,
        averageMonthlyCommittedSpending: 0,
        leaveStartDate: '2026-06-01',
      },
      calculationResult: null,
    })
  })

  it('initializes with the test reset values', () => {
    const state = useMaternityStore.getState()

    expect(state.salaryData.averageMonthlyTakeHomePay).toBe(0)
    expect(state.calculationResult).toBeNull()
  })

  it('updates salary data, persists it, and triggers calculation', () => {
    const { setSalaryData } = useMaternityStore.getState()

    setSalaryData({
      averageMonthlyTakeHomePay: 4333.333333333333,
      averageMonthlyCommittedSpending: 2500,
      leaveStartDate: '2026-06-01',
    })

    const state = useMaternityStore.getState()
    expect(state.salaryData.averageMonthlyTakeHomePay).toBeCloseTo(4333.33, 2)
    expect(state.salaryData.averageMonthlyCommittedSpending).toBe(2500)
    expect(state.calculationResult?.totalPay).toBeGreaterThan(0)
    expect(state.calculationResult?.totalShortfall).toBeGreaterThanOrEqual(0)
    expect(state.calculationResult?.monthlyBreakdown).toHaveLength(12)
    expect(window.localStorage.getItem('maternity-pay-calculator')).toContain(
      'averageMonthlyTakeHomePay',
    )
  })

  it('clears the result when salary is not positive', () => {
    const { setSalaryData } = useMaternityStore.getState()

    setSalaryData({
      averageMonthlyTakeHomePay: 0,
      averageMonthlyCommittedSpending: 2500,
      leaveStartDate: '2026-06-01',
    })

    expect(useMaternityStore.getState().calculationResult).toBeNull()
  })

  it('resets to a useful default calculation', () => {
    const { reset } = useMaternityStore.getState()

    reset()

    const state = useMaternityStore.getState()
    expect(state.salaryData.averageMonthlyTakeHomePay).toBe(3500)
    expect(state.salaryData.averageMonthlyCommittedSpending).toBe(2500)
    expect(state.calculationResult?.weeklyBreakdown).toHaveLength(52)
  })
})
