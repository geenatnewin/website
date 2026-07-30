'use client'

import { useState } from 'react'
import { categoryLabel, metaSummary } from './categories'
import ExpenseForm from './ExpenseForm'

export default function ExpenseLine({ expense, showDate, editExpense, removeExpense, recentGigs }) {
  const [editing, setEditing] = useState(false)

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

  function confirmDelete(e) {
    if (!confirm('Delete this expense? This cannot be undone.')) e.preventDefault()
  }

  return (
    <div>
      <div className="ldg-expense-row">
        {showDate && <span>{new Date(expense.expense_date).toLocaleDateString()}</span>}
        <span>{categoryLabel(expense.category)}</span>
        <span>{expense.vendor || '—'}</span>
        <span className="ldg-expense-amount">${Number(expense.amount).toFixed(2)}</span>
        <div className="ldg-entry-controls ldg-entry-controls-sm">
          <button type="button" className="ldg-icon-btn" onClick={() => setEditing(true)}>Edit</button>
          <form action={removeExpense.bind(null, expense.id)}>
            <button type="submit" className="ldg-icon-btn ldg-icon-btn-danger" onClick={confirmDelete}>Delete</button>
          </form>
        </div>
      </div>
      {metaSummary(expense.category, expense.meta) && (
        <div className="ldg-expense-meta">{metaSummary(expense.category, expense.meta)}</div>
      )}
    </div>
  )
}
