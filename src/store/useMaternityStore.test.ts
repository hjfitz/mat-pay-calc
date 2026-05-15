import { describe, it, expect, beforeEach } from 'vitest'
import { useMaternityStore } from './useMaternityStore'

describe('useMaternityStore', () => {
  beforeEach(() => {
    // Reset store state if needed (Zustand persists state in memory during tests)
    useMaternityStore.setState({
      salaryData: { monthlyPreTax: 0, leaveStartDate: new Date().toISOString() },
      calculationResult: null
    })
  })

  it('should initialize with default values', () => {
    const state = useMaternityStore.getState()
    expect(state.salaryData.monthlyPreTax).toBe(0)
    expect(state.calculationResult).toBeNull()
  })

  it('should update salary data and trigger calculation', () => {
    const { setSalaryData } = useMaternityStore.getState()
    
    setSalaryData({ monthlyPreTax: 4000, leaveStartDate: '2026-06-01' })
    
    const state = useMaternityStore.getState()
    expect(state.salaryData.monthlyPreTax).toBe(4000)
    expect(state.calculationResult).not.toBeNull()
    expect(state.calculationResult?.totalPay).toBeGreaterThan(0)
  })

  it('should update policy and trigger calculation', () => {
    const { setPolicy, setSalaryData } = useMaternityStore.getState()
    
    setSalaryData({ monthlyPreTax: 4000, leaveStartDate: '2026-06-01' })
    
    const initialResult = useMaternityStore.getState().calculationResult
    
    setPolicy({
      id: 'custom',
      name: 'Custom',
      smpRules: {
        standardRate: 200, // Higher than default
        lowerEarningsLimit: 123,
        higherRatePercentage: 90,
        higherRateWeeks: 6,
        standardRateWeeks: 33,
      },
      companyRules: []
    })
    
    const updatedResult = useMaternityStore.getState().calculationResult
    expect(updatedResult?.totalPay).not.toBe(initialResult?.totalPay)
  })
})
