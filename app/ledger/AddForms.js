'use client'

import { useRef, useState } from 'react'
import GigForm from './GigForm'
import ExpenseForm from './ExpenseForm'

export default function AddForms({ addGig, addExpense, recentGigs }) {
  const [openForm, setOpenForm] = useState(null) // null | 'gig' | 'expense'
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
    showToast()
  }

  async function handleAddExpense(formData) {
    await addExpense(formData)
    setExpenseFormKey((k) => k + 1) // remounts ExpenseForm, clearing every field
    showToast()
  }

  function toggle(name) {
    setOpenForm((current) => (current === name ? null : name))
  }

  return (
    <section className="ldg-add-section">
      <div className="ldg-add-buttons">
        <button
          type="button"
          className={`ldg-btn ldg-btn-gig ${openForm === 'gig' ? 'ldg-btn-active' : ''}`}
          onClick={() => toggle('gig')}
        >
          {openForm === 'gig' ? 'Cancel' : '+ Add gig'}
        </button>
        <button
          type="button"
          className={`ldg-btn ldg-btn-expense ${openForm === 'expense' ? 'ldg-btn-active' : ''}`}
          onClick={() => toggle('expense')}
        >
          {openForm === 'expense' ? 'Cancel' : '+ Add expense'}
        </button>
      </div>

      {openForm === 'gig' && <GigForm key={gigFormKey} action={handleAddGig} />}
      {openForm === 'expense' && <ExpenseForm key={expenseFormKey} action={handleAddExpense} recentGigs={recentGigs} />}

      {toastId > 0 && <div className="ldg-toast" key={toastId}>ADDED</div>}
    </section>
  )
}
