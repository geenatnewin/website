export const dynamic = 'force-dynamic'

import { getGigs, getExpenses, getRecentGigsForDropdown } from './db'
import { addGig, editGig, removeGig, addExpense, editExpense, removeExpense, logout } from './actions'
import { mileageDeduction } from './mileage'
import { formatMoney } from './format'
import DashboardSections from './DashboardSections'
import LedgerShell from './LedgerShell'
import RemindersBanner from './RemindersBanner'
import StatCard from './StatCard'

export const metadata = { title: 'Dashboard' }

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

  const netIsNegative = net < 0

  return (
    <LedgerShell active="dashboard" logout={logout}>
      <h1 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-white md:text-left">Dashboard</h1>

      <RemindersBanner gigs={gigs} expenses={expenses} />

      <section className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard label="Income (all-time)" value={`$${formatMoney(totalIncome)}`} rawValue={totalIncome} tone="brand" canGlow />
        <StatCard label="Expenses (all-time)" value={`$${formatMoney(totalExpenses)}`} rawValue={totalExpenses} tone="neutral" />
        <StatCard label="Mileage deduction" value={`$${formatMoney(totalMileageDeduction)}`} rawValue={totalMileageDeduction} tone="neutral" />
        <StatCard label="Net" value={`$${formatMoney(net)}`} rawValue={net} tone={netIsNegative ? 'critical' : 'good'} canGlow />
      </section>

      <DashboardSections
        gigs={gigs}
        expensesByGig={expensesByGig}
        generalExpenses={generalExpenses}
        addGig={addGig}
        editGig={editGig}
        removeGig={removeGig}
        addExpense={addExpense}
        editExpense={editExpense}
        removeExpense={removeExpense}
        recentGigs={recentGigs}
      />
    </LedgerShell>
  )
}
