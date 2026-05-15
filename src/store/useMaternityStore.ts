import { create } from 'zustand'
import { MaternityPolicy, SalaryData, CalculationResult } from '../types/maternity'
import { calculateMaternityPay } from '../utils/calculator'

interface MaternityState {
  salaryData: SalaryData
  policy: MaternityPolicy
  calculationResult: CalculationResult | null
  setSalaryData: (data: SalaryData) => void
  setPolicy: (policy: MaternityPolicy) => void
  calculate: () => void
}

const defaultPolicy: MaternityPolicy = {
  id: 'standard-smp',
  name: 'Standard Statutory Maternity Pay',
  smpRules: {
    standardRate: 184.03,
    lowerEarningsLimit: 123,
    higherRatePercentage: 90,
    higherRateWeeks: 6,
    standardRateWeeks: 33,
  },
  companyRules: [],
}

export const useMaternityStore = create<MaternityState>((set, get) => ({
  salaryData: {
    monthlyPreTax: 0,
    leaveStartDate: new Date().toISOString(),
  },
  policy: defaultPolicy,
  calculationResult: null,

  setSalaryData: (salaryData) => {
    set({ salaryData })
    get().calculate()
  },

  setPolicy: (policy) => {
    set({ policy })
    get().calculate()
  },

  calculate: () => {
    const { salaryData, policy } = get()
    if (salaryData.monthlyPreTax > 0) {
      const result = calculateMaternityPay(salaryData, policy)
      set({ calculationResult: result })
    } else {
      set({ calculationResult: null })
    }
  },
}))
