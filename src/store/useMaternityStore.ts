import { create } from 'zustand'
import type { CalculationResult, SalaryData } from '../types/maternity'
import { calculateMaternityPay } from '../utils/calculator'

interface MaternityState {
  salaryData: SalaryData
  calculationResult: CalculationResult | null
  setSalaryData: (data: SalaryData) => void
  reset: () => void
  calculate: () => void
}

const STORAGE_KEY = 'maternity-pay-calculator'

const defaultSalaryData: SalaryData = {
  averageMonthlyTakeHomePay: 3500,
  averageMonthlyCommittedSpending: 2500,
  leaveStartDate: new Date().toISOString().slice(0, 10),
}

function readStoredSalaryData(): SalaryData {
  if (typeof window === 'undefined') return defaultSalaryData

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultSalaryData

    const parsed = JSON.parse(stored) as Partial<SalaryData> & {
      averageMonthlyGrossPay?: unknown
      grossAnnualSalary?: unknown
    }
    const averageMonthlyTakeHomePay =
      typeof parsed.averageMonthlyTakeHomePay === 'number'
        ? parsed.averageMonthlyTakeHomePay
        : typeof parsed.averageMonthlyGrossPay === 'number'
          ? parsed.averageMonthlyGrossPay
          : typeof parsed.grossAnnualSalary === 'number'
            ? parsed.grossAnnualSalary / 12
          : null
    const averageMonthlyCommittedSpending =
      typeof parsed.averageMonthlyCommittedSpending === 'number'
        ? parsed.averageMonthlyCommittedSpending
        : defaultSalaryData.averageMonthlyCommittedSpending

    if (
      typeof averageMonthlyTakeHomePay === 'number' &&
      Number.isFinite(averageMonthlyTakeHomePay) &&
      Number.isFinite(averageMonthlyCommittedSpending) &&
      typeof parsed.leaveStartDate === 'string'
    ) {
      return {
        averageMonthlyTakeHomePay,
        averageMonthlyCommittedSpending,
        leaveStartDate: parsed.leaveStartDate,
      }
    }
  } catch {
    return defaultSalaryData
  }

  return defaultSalaryData
}

function persistSalaryData(salaryData: SalaryData) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(salaryData))
}

const initialSalaryData = readStoredSalaryData()

export const useMaternityStore = create<MaternityState>((set, get) => ({
  salaryData: initialSalaryData,
  calculationResult:
    initialSalaryData.averageMonthlyTakeHomePay > 0 ? calculateMaternityPay(initialSalaryData) : null,

  setSalaryData: (salaryData) => {
    set({ salaryData })
    persistSalaryData(salaryData)
    get().calculate()
  },

  reset: () => {
    set({
      salaryData: defaultSalaryData,
      calculationResult: calculateMaternityPay(defaultSalaryData),
    })
    persistSalaryData(defaultSalaryData)
  },

  calculate: () => {
    const { salaryData } = get()
    if (salaryData.averageMonthlyTakeHomePay > 0 && salaryData.leaveStartDate) {
      const result = calculateMaternityPay(salaryData)
      set({ calculationResult: result })
    } else {
      set({ calculationResult: null })
    }
  },
}))
