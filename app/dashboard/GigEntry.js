'use client'

import { useState, useRef } from 'react'
import { mileageDeduction } from './mileage'
import { formatMoney } from './format'
import GigForm from './GigForm'
import ExpenseLine from './ExpenseLine'
import ConfirmModal from './ConfirmModal'

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
  const [confirming, setConfirming] = useState(false)
  const formRef = useRef(null)

  if (editing) {
    return (
      <div className={`ldg-entry ldg-entry-${gig.gig_type}`}>
        <GigForm action={editGig.bind(null, gig.id)} initial={gig} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  const warning = expenses.length > 0
    ? ` Its ${expenses.length} linked expense${expenses.length === 1 ? '' : 's'} will be kept but unlinked.`
    : ''

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
        <span className="ldg-entry-amount">${formatMoney(gig.gross_payment)}</span>
        <div className="ldg-entry-controls">
          <button type="button" className="ldg-icon-btn" onClick={() => setEditing(true)}>Edit</button>
          <form ref={formRef} action={removeGig.bind(null, gig.id)}>
            <button type="button" className="ldg-icon-btn ldg-icon-btn-danger" onClick={() => setConfirming(true)}>Delete</button>
          </form>
        </div>
      </div>
      {Number(gig.mileage) > 0 && (
        <div className="ldg-entry-sub">
          Mileage: {gig.mileage} mi → ${formatMoney(mileageDeduction(gig.gig_date, gig.mileage))} deduction (est.)
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
      <ConfirmModal
        open={confirming}
        title="Delete gig?"
        message={`Delete the gig "${gig.client}"?${warning} This cannot be undone.`}
        onConfirm={() => {
          setConfirming(false)
          formRef.current?.requestSubmit()
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
