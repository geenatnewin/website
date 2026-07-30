'use client'

import { useState, useRef } from 'react'
import { categoryLabel, metaSummary } from './categories'
import { formatMoney } from './format'
import ExpenseForm from './ExpenseForm'
import ConfirmModal from './ConfirmModal'

export default function ExpenseLine({ expense, showDate, editExpense, removeExpense, recentGigs }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const formRef = useRef(null)

  if (editing) {
    return (
      <ExpenseForm
        action={editExpense.bind(null, expense.id)}
        initial={expense}
        recentGigs={recentGigs}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div>
      <div className="ldg-expense-row">
        {showDate && <span>{new Date(expense.expense_date).toLocaleDateString()}</span>}
        <span>{categoryLabel(expense.category)}</span>
        <span>{expense.vendor || '—'}</span>
        <span className="ldg-expense-amount">${formatMoney(expense.amount)}</span>
        <div className="ldg-entry-controls ldg-entry-controls-sm">
          <button type="button" className="ldg-icon-btn" onClick={() => setEditing(true)}>Edit</button>
          <form ref={formRef} action={removeExpense.bind(null, expense.id)}>
            <button type="button" className="ldg-icon-btn ldg-icon-btn-danger" onClick={() => setConfirming(true)}>Delete</button>
          </form>
        </div>
      </div>
      {metaSummary(expense.category, expense.meta) && (
        <div className="ldg-expense-meta">{metaSummary(expense.category, expense.meta)}</div>
      )}
      <ConfirmModal
        open={confirming}
        title="Delete expense?"
        message="Delete this expense? This cannot be undone."
        onConfirm={() => {
          setConfirming(false)
          formRef.current?.requestSubmit()
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
