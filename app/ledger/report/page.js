export const dynamic = 'force-dynamic'

import { getGigs, getExpenses } from '../db'
import { mileageDeduction } from '../mileage'
import { EXPENSE_CATEGORIES, categoryScheduleCLine } from '../categories'
import PrintButton from './PrintButton'

export const metadata = { title: 'Ledger — Report' }

function quarterIndex(dateInput) {
  return Math.floor(new Date(dateInput).getMonth() / 3)
}

export default async function LedgerReport() {
  const [gigs, expenses] = await Promise.all([getGigs(), getExpenses()])

  const totalIncome = gigs.reduce((s, g) => s + Number(g.gross_payment), 0)
  const totalMileage = gigs.reduce((s, g) => s + Number(g.mileage || 0), 0)
  const mileageDeductionTotal = gigs.reduce((s, g) => s + mileageDeduction(g.gig_date, g.mileage), 0)

  const byCategory = {}
  for (const c of EXPENSE_CATEGORIES) byCategory[c.value] = 0
  for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount)

  const categoryExpenseTotal = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const totalExpenses = categoryExpenseTotal + mileageDeductionTotal
  const netProfit = totalIncome - totalExpenses

  const quarters = [
    { label: 'Q1', income: 0, expenses: 0 },
    { label: 'Q2', income: 0, expenses: 0 },
    { label: 'Q3', income: 0, expenses: 0 },
    { label: 'Q4', income: 0, expenses: 0 },
  ]
  for (const g of gigs) {
    const qi = quarterIndex(g.gig_date)
    quarters[qi].income += Number(g.gross_payment)
    quarters[qi].expenses += mileageDeduction(g.gig_date, g.mileage)
  }
  for (const e of expenses) {
    const qi = quarterIndex(e.expense_date)
    quarters[qi].expenses += Number(e.amount)
  }

  const byClient = {}
  for (const g of gigs) byClient[g.client] = (byClient[g.client] || 0) + Number(g.gross_payment)
  const likely1099 = Object.entries(byClient)
    .filter(([, total]) => total >= 600)
    .sort((a, b) => b[1] - a[1])

  return (
    <>
      <nav className="ldg-nav ldg-no-print">
        <span className="ldg-brand">[LEDGER]</span>
        <div className="ldg-nav-links">
          <a href="/ledger">[DASHBOARD]</a>
          <a href="/api/ledger/export">[EXPORT CSV]</a>
        </div>
      </nav>

      <div className="ldg-report">
        <section className="ldg-report-section">
          <p className="ldg-report-title">FIG. 1 — Summary (Schedule C style)</p>
          <div className="ldg-report-row">
            <span>Gross receipts</span>
            <span>${totalIncome.toFixed(2)}</span>
          </div>
          {EXPENSE_CATEGORIES.map((c) => (
            <div className="ldg-report-row" key={c.value}>
              <span>{c.label} <span className="ldg-report-sub">{c.scheduleC}</span></span>
              <span>${byCategory[c.value].toFixed(2)}</span>
            </div>
          ))}
          <div className="ldg-report-row">
            <span>Car & truck expenses (mileage) <span className="ldg-report-sub">Line 9 · {totalMileage.toFixed(1)} mi</span></span>
            <span>${mileageDeductionTotal.toFixed(2)}</span>
          </div>
          <div className="ldg-report-row ldg-report-total">
            <span>Total expenses</span>
            <span>${totalExpenses.toFixed(2)}</span>
          </div>
          <div className="ldg-report-row ldg-report-total">
            <span>Net profit</span>
            <span>${netProfit.toFixed(2)}</span>
          </div>
        </section>

        <section className="ldg-report-section">
          <p className="ldg-report-title">FIG. 2 — By quarter (for estimated tax payments)</p>
          <div className="ldg-quarter-grid">
            {quarters.map((q) => (
              <div className="ldg-quarter-cell" key={q.label}>
                <span>{q.label}</span>
                <div>Income: ${q.income.toFixed(2)}</div>
                <div>Expenses: ${q.expenses.toFixed(2)}</div>
                <div>Net: ${(q.income - q.expenses).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="ldg-report-section">
          <p className="ldg-report-title">FIG. 3 — Clients paid $600+ (likely 1099 territory)</p>
          {likely1099.length === 0 && <p className="ldg-empty">No client has hit $600 yet.</p>}
          {likely1099.map(([client, total]) => (
            <div className="ldg-report-row" key={client}>
              <span>{client}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          ))}
        </section>

        <PrintButton />
      </div>
    </>
  )
}
