import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import App from './App'
import { useMaternityStore } from './store/useMaternityStore'

beforeEach(() => {
  window.localStorage.clear()
  useMaternityStore.setState({
    salaryData: {
      averageMonthlyTakeHomePay: 4333.333333333333,
      averageMonthlyCommittedSpending: 2500,
      leaveStartDate: '2026-06-01',
    },
    calculationResult: null,
  })
  useMaternityStore.getState().calculate()
})

test('renders the maternity pay dashboard', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /see your take-home leave pay by month/i })).toBeInTheDocument()
  expect(screen.getByLabelText(/average monthly pay after deductions/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/average monthly commitments/i)).toBeInTheDocument()
  expect(screen.getByText(/total estimated take-home/i)).toBeInTheDocument()
  expect(screen.getByText(/total shortfall/i)).toBeInTheDocument()
  expect(screen.getByText(/smp floor is shown as an approximate/i)).toBeInTheDocument()
  expect(screen.getByText(/tax bands, ni rates, student loans/i)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /assumptions and privacy/i })).toBeInTheDocument()
  expect(screen.getByText(/not sent to a server/i)).toBeInTheDocument()
  expect(screen.getByRole('table', { name: /monthly payment breakdown/i })).toBeInTheDocument()
})

test('copies the monthly breakdown as csv', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  render(<App />)

  await userEvent.click(screen.getByRole('button', { name: /copy csv/i }))

  expect(writeText).toHaveBeenCalledWith(
    expect.stringContaining('Month,Leave days,Rate mix,Estimated take-home pay,Monthly commitments'),
  )
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('June 2026'))
  expect(screen.getByText(/csv copied/i)).toBeInTheDocument()
})

test('saves the monthly breakdown as csv', async () => {
  const createObjectURL = vi.fn(() => 'blob:csv')
  const revokeObjectURL = vi.fn()
  const click = vi.fn()
  const createElement = document.createElement.bind(document)

  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL,
    revokeObjectURL,
  })
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    const element = createElement(tagName)
    if (tagName === 'a') {
      Object.defineProperty(element, 'click', { configurable: true, value: click })
    }
    return element
  })

  render(<App />)

  await userEvent.click(screen.getByRole('button', { name: /save csv/i }))

  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  expect(click).toHaveBeenCalled()
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv')
})
