export const dynamic = 'force-dynamic'

import { getGigs, getExpenses, getRecentGigsForDropdown } from './db'
import { addGig, addExpense, logout } from './actions'
import { categoryLabel, metaSummary } from './categories'
import { mileageDeduction } from './mileage'
import AddForms from './AddForms'
import RevealAmount from './RevealAmount'
import LedgerShell from './LedgerShell'

export const metadata = { title: 'Ledger' }

export default async function LedgerDashboard() {
  const [gigs, expenses, recentGigs] = await Promise.all([
    getGigs(),
    getExpenses(),
    getRecentGigsForDropdown(),
  ])

  const totalIncome = gigs.reduce((sum, g) => sum + Number(g.gross_payment), 0)
  const totalMileageDeduction = gigs.reduce(
    (sum, g) => sum + mileageDeduction(g.gig_date, g.mileage),
    0
  )
  const expenseLineTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalExpenses = expenseLineTotal + totalMileageDeduction
  const net = totalIncome - totalExpenses

  const expensesByGig = {}
  const generalExpenses = []
  for (const e of expenses) {
    if (e.gig_id) {
      ;(expensesByGig[e.gig_id] ??= []).push(e)
    } else {
      generalExpenses.push(e)
    }
  }

  return (
    <LedgerShell active="dashboard" logout={logout}>
      <h1 className="ldg-page-title">Dashboard</h1>

      <section className="ldg-stat-grid">
        <div className="ldg-stat-card ldg-stat-grad-1">
          <span className="ldg-stat-label">Income (all-time)</span>
          <RevealAmount value={`$${totalIncome.toFixed(2)}`} />
        </div>
        <div className="ldg-stat-card ldg-stat-grad-2">
          <span className="ldg-stat-label">Expenses (all-time)</span>
          <RevealAmount value={`$${totalExpenses.toFixed(2)}`} />
        </div>
        <div className="ldg-stat-card ldg-stat-grad-3">
          <span className="ldg-stat-label">Mileage deduction</span>
          <RevealAmount value={`$${totalMileageDeduction.toFixed(2)}`} />
        </div>
        <div className={`ldg-stat-card ${net < 0 ? 'ldg-stat-grad-critical' : 'ldg-stat-grad-good'}`}>
          <span className="ldg-stat-label">Net</span>
          <RevealAmount value={`$${net.toFixed(2)}`} />
        </div>
      </section>

      <AddForms addGig={addGig} addExpense={addExpense} recentGigs={recentGigs} />

      <section className="ldg-card ldg-list">
        <p className="ldg-card-title">Gigs</p>
        {gigs.length === 0 && <p className="ldg-empty">No gigs logged yet.</p>}
        {gigs.map((g, i) => (
          <div className={`ldg-entry ldg-entry-${g.gig_type}`} key={g.id}>
            <div className="ldg-entry-head">
              <span className="ldg-entry-num">{String(gigs.length - i).padStart(3, '0')}</span>
              <span className="ldg-entry-date">{new Date(g.gig_date).toLocaleDateString()}</span>
              <span className="ldg-entry-client">{g.client}</span>
              <span className={`ldg-entry-type ldg-type-${g.gig_type}`}>
                {g.gig_type === 'other' && g.gig_type_other ? g.gig_type_other : g.gig_type}
              </span>
              <span className={`ldg-status ldg-status-${g.status}`}>{g.status}</span>
              <span className="ldg-entry-amount">${Number(g.gross_payment).toFixed(2)}</span>
            </div>
            {Number(g.mileage) > 0 && (
              <div className="ldg-entry-sub">
                Mileage: {g.mileage} mi → ${mileageDeduction(g.gig_date, g.mileage).toFixed(2)} deduction (est.)
              </div>
            )}
            {g.notes && <div className="ldg-entry-sub">{g.notes}</div>}
            {(expensesByGig[g.id] || []).map((e) => (
              <div key={e.id}>
                <div className="ldg-expense-row">
                  <span>{categoryLabel(e.category)}</span>
                  <span>{e.vendor || '—'}</span>
                  <span>${Number(e.amount).toFixed(2)}</span>
                </div>
                {metaSummary(e.category, e.meta) && (
                  <div className="ldg-expense-meta">{metaSummary(e.category, e.meta)}</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>

      {generalExpenses.length > 0 && (
        <section className="ldg-card ldg-list">
          <p className="ldg-card-title">General expenses</p>
          {generalExpenses.map((e) => (
            <div key={e.id}>
              <div className="ldg-expense-row">
                <span>{new Date(e.expense_date).toLocaleDateString()}</span>
                <span>{categoryLabel(e.category)}</span>
                <span>{e.vendor || '—'}</span>
                <span>${Number(e.amount).toFixed(2)}</span>
              </div>
              {metaSummary(e.category, e.meta) && (
                <div className="ldg-expense-meta">{metaSummary(e.category, e.meta)}</div>
              )}
            </div>
          ))}
        </section>
      )}
    </LedgerShell>
  )
}
