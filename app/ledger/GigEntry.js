'use client'

import { useState } from 'react'
import { mileageDeduction } from './mileage'
import GigForm from './GigForm'
import ExpenseLine from './ExpenseLine'

export default function GigEntry({
  gig,
  displayNum,
  expenses,
  editGig,
  removeGig,
  editExpense,
  removeExpense,
  recentGigs,
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className={`ldg-entry ldg-entry-${gig.gig_type}`}>
        <GigForm action={editGig.bind(null, gig.id)} initial={gig} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  function confirmDelete(e) {
    const warning = expenses.length > 0
      ? ` Its ${expenses.length} linked expense${expenses.length === 1 ? '' : 's'} will be kept but unlinked.`
      : ''
    if (!confirm(`Delete the gig "${gig.client}"?${warning} This cannot be undone.`)) e.preventDefault()
  }

  return (
    <div className={`ldg-entry ldg-entry-${gig.gig_type}`}>
      <div className="ldg-entry-head">
        <span className="ldg-entry-num">{displayNum}</span>
        <span className="ldg-entry-date">{new Date(gig.gig_date).toLocaleDateString()}</span>
        <span className="ldg-entry-client">{gig.client}</span>
        <span className={`ldg-entry-type ldg-type-${gig.gig_type}`}>
          {gig.gig_type === 'other' && gig.gig_type_other ? gig.gig_type_other : gig.gig_type}
        </span>
        <span className={`ldg-status ldg-status-${gig.status}`}>{gig.status}</span>
        <span className="ldg-entry-amount">${Number(gig.gross_payment).toFixed(2)}</span>
        <div className="ldg-entry-controls">
          <button type="button" className="ldg-icon-btn" onClick={() => setEditing(true)}>Edit</button>
          <form action={removeGig.bind(null, gig.id)}>
            <button type="submit" className="ldg-icon-btn ldg-icon-btn-danger" onClick={confirmDelete}>Delete</button>
          </form>
        </div>
      </div>
      {Number(gig.mileage) > 0 && (
        <div className="ldg-entry-sub">
          Mileage: {gig.mileage} mi → ${mileageDeduction(gig.gig_date, gig.mileage).toFixed(2)} deduction (est.)
        </div>
      )}
      {gig.notes && <div className="ldg-entry-sub">{gig.notes}</div>}
      {expenses.map((e) => (
        <ExpenseLine
          key={e.id}
          expense={e}
          editExpense={editExpense}
          removeExpense={removeExpense}
          recentGigs={recentGigs}
        />
      ))}
    </div>
  )
}
