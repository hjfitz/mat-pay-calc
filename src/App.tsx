import { useState, type CSSProperties } from 'react'
import './App.css'
import { useMaternityStore } from './store/useMaternityStore'
import type { CalculationResult, MonthlyPayment } from './types/maternity'

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const preciseCurrencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatPreciseCurrency(value: number) {
  return preciseCurrencyFormatter.format(value)
}

function formatRate(rate: number) {
  return `${Math.round(rate * 100)}%`
}

function escapeCsvCell(value: string | number) {
  const stringValue = String(value)
  if (!/[",\n]/.test(stringValue)) return stringValue
  return `"${stringValue.replaceAll('"', '""')}"`
}

function getRateMix(month: MonthlyPayment) {
  return month.rates.map(formatRate).join(' / ')
}

function buildMonthlyCsv(result: CalculationResult, averageMonthlyCommittedSpending: number) {
  const rows = [
    [
      'Month',
      'Leave days',
      'Rate mix',
      'Estimated take-home pay',
      'Monthly commitments',
      'Money left over',
      'Shortfall',
      'Enhanced pay estimate',
      'SMP floor adjustment',
    ],
    ...result.monthlyBreakdown.map((month) => [
      month.month,
      month.leaveDayCount,
      getRateMix(month),
      month.takeHomeAmount.toFixed(2),
      averageMonthlyCommittedSpending.toFixed(2),
      month.moneyLeftOver.toFixed(2),
      month.shortfallAmount.toFixed(2),
      month.enhancedAmount.toFixed(2),
      month.smpFloorAmount.toFixed(2),
    ]),
  ]

  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
}

function getCsvFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `maternity-pay-${date}.csv`
}

function App() {
  const { salaryData, calculationResult, setSalaryData, reset } = useMaternityStore()
  const [copyStatus, setCopyStatus] = useState('')
  const maxMonthlyPay = Math.max(
    ...(calculationResult?.monthlyBreakdown.map((month) => month.takeHomeAmount) ?? [0]),
  )
  const maxMonthlyBalance = Math.max(
    ...(calculationResult?.monthlyBreakdown.map((month) => Math.abs(month.moneyLeftOver)) ?? [0]),
  )

  async function copyCsv() {
    if (!calculationResult) return

    try {
      await navigator.clipboard.writeText(
        buildMonthlyCsv(calculationResult, salaryData.averageMonthlyCommittedSpending),
      )
      setCopyStatus('CSV copied')
    } catch {
      setCopyStatus('Copy failed')
    }
  }

  function saveCsv() {
    if (!calculationResult) return

    const blob = new Blob(
      [buildMonthlyCsv(calculationResult, salaryData.averageMonthlyCommittedSpending)],
      { type: 'text/csv;charset=utf-8' },
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = getCsvFileName()
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Maternity pay planner</p>
          <h1 id="page-title">See your take-home leave pay by month</h1>
          <p className="intro-copy">
            Enter your average monthly pay after deductions, regular monthly commitments, and
            leave start date. The calculator derives weekly pay from your take-home figure, then
            applies 100%, 60%, 50%, and 40% enhanced pay tiers over 52 elapsed weeks.
          </p>
          <p className="supporting-note">
            The SMP floor is shown as an approximate displayed floor. In real payroll it is a
            gross statutory amount and PAYE can vary by tax code, year-to-date earnings, tax
            bands, NI rates, student loans, pension deductions, employer policy, and statutory
            rates. Check these assumptions before relying on the figures.
          </p>
        </div>

        <form className="input-grid" aria-label="Maternity pay inputs">
          <label>
            <span>Average monthly pay after deductions</span>
            <div className="money-input">
              <span aria-hidden="true">GBP</span>
              <input
                min="0"
                step="100"
                type="number"
                value={salaryData.averageMonthlyTakeHomePay || ''}
                onChange={(event) =>
                  setSalaryData({
                    ...salaryData,
                    averageMonthlyTakeHomePay: Number(event.target.value),
                  })
                }
              />
            </div>
          </label>

          <label>
            <span>Leave start date</span>
            <input
              type="date"
              value={salaryData.leaveStartDate}
              onChange={(event) =>
                setSalaryData({
                  ...salaryData,
                  leaveStartDate: event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Average monthly commitments</span>
            <div className="money-input">
              <span aria-hidden="true">GBP</span>
              <input
                min="0"
                step="100"
                type="number"
                value={salaryData.averageMonthlyCommittedSpending || ''}
                onChange={(event) =>
                  setSalaryData({
                    ...salaryData,
                    averageMonthlyCommittedSpending: Number(event.target.value),
                  })
                }
              />
            </div>
          </label>

          <button className="secondary-action" type="button" onClick={reset}>
            Reset
          </button>
        </form>
      </section>

      {calculationResult ? (
        <>
          <section className="summary-grid" aria-label="Calculation summary">
            <article>
              <span>Total estimated take-home</span>
              <strong>{formatCurrency(calculationResult.totalPay)}</strong>
            </article>
            <article>
              <span>Normal weekly take-home</span>
              <strong>{formatPreciseCurrency(calculationResult.normalWeeklyTakeHome)}</strong>
            </article>
            <article>
              <span>Normal monthly take-home</span>
              <strong>{formatCurrency(calculationResult.normalMonthlyTakeHome)}</strong>
            </article>
            <article>
              <span>SMP floor adjustment</span>
              <strong>{formatCurrency(calculationResult.smpFloorTotal)}</strong>
            </article>
            <article>
              <span>Total shortfall</span>
              <strong>{formatCurrency(calculationResult.totalShortfall)}</strong>
            </article>
          </section>

          <section className="chart-section" aria-labelledby="chart-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">12 month view</p>
                <h2 id="chart-title">Payment timeline</h2>
              </div>
              <div className="chart-key" aria-label="Chart legend">
                <span>
                  <i className="key-pay" aria-hidden="true"></i>
                  Take-home pay
                </span>
                <span>
                  <i className="key-leftover" aria-hidden="true"></i>
                  Left over
                </span>
                <span>
                  <i className="key-shortfall" aria-hidden="true"></i>
                  Shortfall
                </span>
              </div>
            </div>

            <div className="timeline-chart" role="list" aria-label="Monthly take-home pay chart">
              {calculationResult.monthlyBreakdown.map((month) => (
                <div className="bar-column" role="listitem" key={month.month}>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        '--bar-size': `${maxMonthlyPay > 0 ? (month.takeHomeAmount / maxMonthlyPay) * 100 : 0}%`,
                      } as CSSProperties}
                    >
                      <span>{formatCurrency(month.takeHomeAmount)}</span>
                    </div>
                  </div>
                  <div
                    className={`balance-track ${month.moneyLeftOver < 0 ? 'is-shortfall' : 'is-leftover'}`}
                    aria-label={`${month.month} ${month.moneyLeftOver < 0 ? 'shortfall' : 'left over'} ${formatPreciseCurrency(Math.abs(month.moneyLeftOver))}`}
                  >
                    <div
                      className="balance-fill"
                      style={{
                        '--balance-size': `${maxMonthlyBalance > 0 ? (Math.abs(month.moneyLeftOver) / maxMonthlyBalance) * 100 : 0}%`,
                      } as CSSProperties}
                    >
                      <span>
                        {month.moneyLeftOver < 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(month.moneyLeftOver))}
                      </span>
                    </div>
                  </div>
                  <span className="bar-label">{month.month.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="table-section" aria-labelledby="breakdown-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Details</p>
                <h2 id="breakdown-title">Monthly breakdown</h2>
              </div>
              <div className="table-actions">
                <button className="secondary-action compact-action" type="button" onClick={copyCsv}>
                  Copy CSV
                </button>
                <button className="secondary-action compact-action" type="button" onClick={saveCsv}>
                  Save CSV
                </button>
                <span aria-live="polite">{copyStatus}</span>
              </div>
            </div>

            <div className="breakdown-table" role="table" aria-label="Monthly payment breakdown">
              <div className="table-row table-head" role="row">
                <span role="columnheader">Month</span>
                <span role="columnheader">Leave days</span>
                <span role="columnheader">Main rate</span>
                <span role="columnheader">Take-home pay</span>
                <span role="columnheader">Money left over</span>
              </div>
              {calculationResult.monthlyBreakdown.map((month) => (
                <div className="table-row" role="row" key={month.month}>
                  <span role="cell">{month.month}</span>
                  <span role="cell">{month.leaveDayCount}</span>
                  <span role="cell">{formatRate(month.dominantRate)}</span>
                  <strong role="cell">{formatPreciseCurrency(month.takeHomeAmount)}</strong>
                  <strong role="cell">{formatPreciseCurrency(month.moneyLeftOver)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="assumptions-section" aria-labelledby="assumptions-title">
            <div>
              <p className="eyebrow">Before you rely on it</p>
              <h2 id="assumptions-title">Assumptions and privacy</h2>
            </div>
            <ul>
              <li>Your pay and commitment figures stay in this browser and are not sent to a server.</li>
              <li>Monthly commitments are assumed to stay the same throughout the leave period.</li>
              <li>The employer policy is fixed at 100%, 60%, 50%, then 40% over 52 elapsed weeks.</li>
              <li>
                Tax bands, NI, pension deductions, student loans, employer rules, and statutory rates
                can change, so treat this as a planning estimate.
              </li>
            </ul>
          </section>
        </>
      ) : (
        <section className="empty-state" aria-live="polite">
          Enter monthly take-home pay greater than zero to calculate maternity pay.
        </section>
      )}
    </main>
  )
}

export default App
