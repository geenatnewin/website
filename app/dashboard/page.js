export const dynamic = 'force-dynamic'

import { getGigs, getExpenses, getRecentGigsForDropdown } from './db'
import { addGig, editGig, removeGig, addExpense, editExpense, removeExpense, logout } from './actions'
import { mileageDeduction } from './mileage'
import { formatMoney } from './format'
import AddForms from './AddForms'
import RevealAmount from './RevealAmount'
import LedgerShell from './LedgerShell'
import RemindersBanner from './RemindersBanner'
import GigEntry from './GigEntry'
import ExpenseLine from './ExpenseLine'

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

      <RemindersBanner gigs={gigs} expenses={expenses} />

      <section className="ldg-stat-grid">
        <div className="ldg-stat-card ldg-stat-grad-1">
          <span className="ldg-stat-label">Income (all-time)</span>
          <RevealAmount value={`$${formatMoney(totalIncome)}`} />
        </div>
        <div className="ldg-stat-card ldg-stat-grad-2">
          <span className="ldg-stat-label">Expenses (all-time)</span>
          <RevealAmount value={`$${formatMoney(totalExpenses)}`} />
        </div>
        <div className="ldg-stat-card ldg-stat-grad-3">
          <span className="ldg-stat-label">Mileage deduction</span>
          <RevealAmount value={`$${formatMoney(totalMileageDeduction)}`} />
        </div>
        <div className={`ldg-stat-card ${net < 0 ? 'ldg-stat-grad-critical' : 'ldg-stat-grad-good'}`}>
          <span className="ldg-stat-label">Net</span>
          <RevealAmount value={`$${formatMoney(net)}`} />
        </div>
      </section>

      <AddForms addGig={addGig} addExpense={addExpense} recentGigs={recentGigs} />

      <section className="ldg-card ldg-list">
        <p className="ldg-card-title">Gigs</p>
        {gigs.length === 0 && <p className="ldg-empty">No gigs logged yet.</p>}
        {gigs.map((g, i) => (
          <GigEntry
            key={g.id}
            gig={g}
            displayNum={String(gigs.length - i).padStart(3, '0')}
            expenses={expensesByGig[g.id] || []}
            editGig={editGig}
            removeGig={removeGig}
            editExpense={editExpense}
            removeExpense={removeExpense}
            recentGigs={recentGigs}
          />
        ))}
      </section>

      {generalExpenses.length > 0 && (
        <section className="ldg-card ldg-list">
          <p className="ldg-card-title">General expenses</p>
          {generalExpenses.map((e) => (
            <ExpenseLine
              key={e.id}
              expense={e}
              showDate
              editExpense={editExpense}
              removeExpense={removeExpense}
              recentGigs={recentGigs}
            />
          ))}
        </section>
      )}
    </LedgerShell>
  )
}
