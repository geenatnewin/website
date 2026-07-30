export const dynamic = 'force-dynamic'

import { getGigs, getExpenses } from '../db'
import { logout } from '../actions'
import { mileageDeduction } from '../mileage'
import { EXPENSE_CATEGORIES, MILEAGE_CHART_COLOR, deductibleAmount } from '../categories'
import LedgerShell from '../LedgerShell'
import PrintButton from './PrintButton'
import CategoryDonut from './CategoryDonut'
import QuarterBars from './QuarterBars'

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
  const byCategoryRaw = {}
  for (const c of EXPENSE_CATEGORIES) {
    byCategory[c.value] = 0
    byCategoryRaw[c.value] = 0
  }
  for (const e of expenses) {
    const raw = Number(e.amount)
    byCategory[e.category] = (byCategory[e.category] || 0) + deductibleAmount(e.category, raw, e.meta)
    byCategoryRaw[e.category] = (byCategoryRaw[e.category] || 0) + raw
  }

  const categoryExpenseTotal = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const totalExpenses = categoryExpenseTotal + mileageDeductionTotal
  const netProfit = totalIncome - totalExpenses

  const donutSegments = [
    ...(mileageDeductionTotal > 0
      ? [{ label: 'Car & mileage', value: mileageDeductionTotal, color: MILEAGE_CHART_COLOR }]
      : []),
    ...EXPENSE_CATEGORIES.filter((c) => byCategory[c.value] > 0).map((c) => ({
      label: c.label,
      value: byCategory[c.value],
      color: c.chartColor,
    })),
  ].sort((a, b) => b.value - a.value)

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
    quarters[qi].expenses += deductibleAmount(e.category, e.amount, e.meta)
  }

  const byClient = {}
  for (const g of gigs) byClient[g.client] = (byClient[g.client] || 0) + Number(g.gross_payment)
  const likely1099 = Object.entries(byClient)
    .filter(([, total]) => total >= 600)
    .sort((a, b) => b[1] - a[1])

  const currentQuarter = quarterIndex(new Date())

  return (
    <LedgerShell active="report" logout={logout}>
      <div className="ldg-report-header ldg-no-print">
        <h1 className="ldg-page-title">Report</h1>
        <PrintButton />
      </div>

      <section className="ldg-report-grid">
        <div className="ldg-card">
          <p className="ldg-card-title">Expenses by category</p>
          <CategoryDonut segments={donutSegments} />
        </div>

        <div className="ldg-card">
          <p className="ldg-card-title">Net by quarter</p>
          <QuarterBars quarters={quarters} currentIndex={currentQuarter} />
        </div>
      </section>

      <section className="ldg-card ldg-report-summary">
        <p className="ldg-card-title">Summary (Schedule C style)</p>
        <div className="ldg-report-row ldg-report-income">
          <span>Gross receipts</span>
          <span>${totalIncome.toFixed(2)}</span>
        </div>
        {EXPENSE_CATEGORIES.map((c) => (
          <div className="ldg-report-row" key={c.value}>
            <span>
              <span className="ldg-legend-dot" style={{ background: `var(--chart-${c.chartColor})` }} />
              {c.label} <span className="ldg-report-sub">{c.scheduleC}</span>
            </span>
            <span>
              ${byCategory[c.value].toFixed(2)}
              {Math.abs(byCategoryRaw[c.value] - byCategory[c.value]) > 0.004 && (
                <span className="ldg-report-sub"> (of ${byCategoryRaw[c.value].toFixed(2)} spent)</span>
              )}
            </span>
          </div>
        ))}
        <div className="ldg-report-row">
          <span>
            <span className="ldg-legend-dot" style={{ background: `var(--chart-${MILEAGE_CHART_COLOR})` }} />
            Car & truck expenses (mileage) <span className="ldg-report-sub">Line 9 · {totalMileage.toFixed(1)} mi</span>
          </span>
          <span>${mileageDeductionTotal.toFixed(2)}</span>
        </div>
        <div className="ldg-report-row ldg-report-total">
          <span>Total expenses</span>
          <span>${totalExpenses.toFixed(2)}</span>
        </div>
        <div className={`ldg-report-row ldg-report-total ${netProfit < 0 ? 'ldg-negative' : 'ldg-positive'}`}>
          <span>Net profit</span>
          <span>${netProfit.toFixed(2)}</span>
        </div>
      </section>

      <section className="ldg-card">
        <p className="ldg-card-title">Clients paid $600+ (likely 1099 territory)</p>
        {likely1099.length === 0 && <p className="ldg-empty">No client has hit $600 yet.</p>}
        {likely1099.map(([client, total]) => (
          <div className="ldg-report-row" key={client}>
            <span>{client} <span className="ldg-badge ldg-badge-warning">1099</span></span>
            <span>${total.toFixed(2)}</span>
          </div>
        ))}
      </section>
    </LedgerShell>
  )
}
