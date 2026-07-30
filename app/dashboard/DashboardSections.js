'use client'

import { useRef, useState } from 'react'
import GigForm from './GigForm'
import ExpenseForm from './ExpenseForm'
import GigEntry from './GigEntry'
import ExpenseLine from './ExpenseLine'
import MonthSection from './MonthSection'
import { formatMoney } from './format'

// gigs/generalExpenses arrive pre-sorted DESC by date from the DB query, and Map
// preserves insertion order, so groups come out newest-month-first for free.
function groupByMonth(entries, dateField) {
  const groups = new Map()
  for (const entry of entries) {
    const d = new Date(entry[dateField])
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!groups.has(key)) {
      groups.set(key, { key, label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), entries: [] })
    }
    groups.get(key).entries.push(entry)
  }
  return Array.from(groups.values())
}

export default function DashboardSections({
  gigs,
  expensesByGig,
  generalExpenses,
  addGig,
  editGig,
  removeGig,
  addExpense,
  editExpense,
  removeExpense,
  recentGigs,
}) {
  const [openBox, setOpenBox] = useState(null) // null | 'gigs' | 'expenses'
  const [showAddGig, setShowAddGig] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [gigFormKey, setGigFormKey] = useState(0)
  const [expenseFormKey, setExpenseFormKey] = useState(0)
  const [toastId, setToastId] = useState(0)
  const toastTimer = useRef(null)

  function showToast() {
    setToastId((id) => id + 1) // new key re-mounts the toast so the fade animation restarts on back-to-back adds
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastId(0), 1800)
  }

  async function handleAddGig(formData) {
    await addGig(formData)
    setGigFormKey((k) => k + 1) // remounts GigForm, clearing every field
    setShowAddGig(false)
    showToast()
  }

  async function handleAddExpense(formData) {
    await addExpense(formData)
    setExpenseFormKey((k) => k + 1) // remounts ExpenseForm, clearing every field
    setShowAddExpense(false)
    showToast()
  }

  function toggleBox(name) {
    setOpenBox((current) => (current === name ? null : name))
  }

  // Numbering ("008", "007"...) has to reflect position in the full flat list, not
  // position within a month's group — compute it once up front, before grouping.
  const gigDisplayNums = new Map(gigs.map((g, i) => [g.id, String(gigs.length - i).padStart(3, '0')]))
  const gigMonths = groupByMonth(gigs, 'gig_date')
  const expenseMonths = groupByMonth(generalExpenses, 'expense_date')

  return (
    <>
      <section className="ldg-add-section">
        <div className="ldg-add-buttons">
          <button
            type="button"
            className={`ldg-btn ldg-btn-gig ${openBox === 'gigs' ? 'ldg-btn-active' : ''}`}
            onClick={() => toggleBox('gigs')}
          >
            Gigs
          </button>
          <button
            type="button"
            className={`ldg-btn ldg-btn-expense ${openBox === 'expenses' ? 'ldg-btn-active' : ''}`}
            onClick={() => toggleBox('expenses')}
          >
            Expenses
          </button>
        </div>
      </section>

      {openBox === 'gigs' && (
        <section className="ldg-card ldg-list">
          <p className="ldg-card-title">Gigs</p>

          <div className="ldg-box-add">
            <button
              type="button"
              className={`ldg-btn ldg-btn-gig ${showAddGig ? 'ldg-btn-active' : ''}`}
              onClick={() => setShowAddGig((v) => !v)}
            >
              {showAddGig ? 'Cancel' : '+ Add gig'}
            </button>
            {showAddGig && <GigForm key={gigFormKey} action={handleAddGig} />}
          </div>

          {gigs.length === 0 && <p className="ldg-empty">No gigs logged yet.</p>}
          {gigMonths.map((group, gi) => (
            <MonthSection
              key={group.key}
              label={group.label}
              count={group.entries.length}
              totalLabel={`$${formatMoney(group.entries.reduce((s, g) => s + Number(g.gross_payment), 0))}`}
              defaultOpen={gi === 0}
            >
              {group.entries.map((g) => (
                <GigEntry
                  key={g.id}
                  gig={g}
                  displayNum={gigDisplayNums.get(g.id)}
                  expenses={expensesByGig[g.id] || []}
                  editGig={editGig}
                  removeGig={removeGig}
                  editExpense={editExpense}
                  removeExpense={removeExpense}
                  recentGigs={recentGigs}
                />
              ))}
            </MonthSection>
          ))}
        </section>
      )}

      {openBox === 'expenses' && (
        <section className="ldg-card ldg-list">
          <p className="ldg-card-title">Expenses</p>

          <div className="ldg-box-add">
            <button
              type="button"
              className={`ldg-btn ldg-btn-expense ${showAddExpense ? 'ldg-btn-active' : ''}`}
              onClick={() => setShowAddExpense((v) => !v)}
            >
              {showAddExpense ? 'Cancel' : '+ Add expense'}
            </button>
            {showAddExpense && <ExpenseForm key={expenseFormKey} action={handleAddExpense} recentGigs={recentGigs} />}
          </div>

          {generalExpenses.length === 0 && <p className="ldg-empty">No general expenses logged yet.</p>}
          {expenseMonths.map((group, gi) => (
            <MonthSection
              key={group.key}
              label={group.label}
              count={group.entries.length}
              totalLabel={`$${formatMoney(group.entries.reduce((s, e) => s + Number(e.amount), 0))}`}
              defaultOpen={gi === 0}
            >
              {group.entries.map((e) => (
                <ExpenseLine
                  key={e.id}
                  expense={e}
                  showDate
                  editExpense={editExpense}
                  removeExpense={removeExpense}
                  recentGigs={recentGigs}
                />
              ))}
            </MonthSection>
          ))}
        </section>
      )}

      {toastId > 0 && <div className="ldg-toast" key={toastId}>ADDED</div>}
    </>
  )
}
