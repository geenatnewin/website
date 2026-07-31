'use client'

import { useRef, useState } from 'react'
import GigForm from './GigForm'
import ExpenseForm from './ExpenseForm'
import GigEntry from './GigEntry'
import ExpenseLine from './ExpenseLine'
import MonthSection from './MonthSection'
import { formatMoney } from './format'

// One accent color, used consistently: selected/primary = filled green,
// everything else = neutral outline. Replaces the old violet-for-Gigs /
// blue-for-Expenses split — that inconsistent second hue was flagged
// directly ("don't like the purple and blue badges").
function ToggleTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-brand shadow-[0_4px_14px_-4px_rgba(34,209,126,0.5)]'
          : 'rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/55 bg-ink-800 border border-white/10 hover:text-white hover:border-white/20 transition-colors'
      }
    >
      {label}
    </button>
  )
}

function AddButton({ label, expanded, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        expanded
          ? 'self-center rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 bg-ink-800 border border-white/10 hover:text-white transition-colors'
          : 'self-center rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-brand shadow-[0_4px_14px_-4px_rgba(34,209,126,0.5)] hover:opacity-90 transition-opacity'
      }
    >
      {label}
    </button>
  )
}

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
      <section className="mb-6 flex flex-wrap gap-3">
        <ToggleTab label="Gigs" active={openBox === 'gigs'} onClick={() => toggleBox('gigs')} />
        <ToggleTab label="Expenses" active={openBox === 'expenses'} onClick={() => toggleBox('expenses')} />
      </section>

      {openBox === 'gigs' && (
        <section className="mb-6 rounded-2xl border border-white/[0.06] bg-ink-900 p-5 md:p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Gigs</p>

          <div className="mb-7 flex flex-col items-center">
            <AddButton
              label={showAddGig ? 'Cancel' : '+ Add gig'}
              expanded={showAddGig}
              onClick={() => setShowAddGig((v) => !v)}
            />
            {showAddGig && <GigForm key={gigFormKey} action={handleAddGig} />}
          </div>

          {gigs.length === 0 && <p className="text-sm text-white/40">No gigs logged yet.</p>}
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
        <section className="mb-6 rounded-2xl border border-white/[0.06] bg-ink-900 p-5 md:p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Expenses</p>

          <div className="mb-7 flex flex-col items-center">
            <AddButton
              label={showAddExpense ? 'Cancel' : '+ Add expense'}
              expanded={showAddExpense}
              onClick={() => setShowAddExpense((v) => !v)}
            />
            {showAddExpense && <ExpenseForm key={expenseFormKey} action={handleAddExpense} recentGigs={recentGigs} />}
          </div>

          {generalExpenses.length === 0 && <p className="text-sm text-white/40">No general expenses logged yet.</p>}
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

      {toastId > 0 && (
        <div
          key={toastId}
          className="fixed bottom-8 left-1/2 z-[999] -translate-x-1/2 animate-[ldg-toast-fade_1.8s_ease_forwards] rounded-full bg-brand px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest text-ink-950 shadow-[0_0_18px_rgba(34,209,126,0.4),0_8px_20px_rgba(0,0,0,0.3)] pointer-events-none"
        >
          Added
        </div>
      )}
    </>
  )
}
