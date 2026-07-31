'use client'

import { useState, useRef } from 'react'
import { mileageDeduction } from './mileage'
import { formatMoney } from './format'
import GigForm from './GigForm'
import ExpenseLine from './ExpenseLine'
import ConfirmModal from './ConfirmModal'

const STATUS_STYLE = {
  paid: 'bg-brand/20 text-brand-soft',
  pending: 'bg-yellow-500/20 text-yellow-400',
}

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
  const [expanded, setExpanded] = useState(false)
  const formRef = useRef(null)

  // "Other" gigs get a neutral border; every real type shares the one accent
  // (no separate hue per type — the badge text already says which type it is).
  const accentBorder = gig.gig_type === 'other' ? 'border-l-white/10' : 'border-l-brand/50'

  if (editing) {
    return (
      <div className={`mb-2.5 rounded-xl border-l-4 bg-ink-800 p-4 last:mb-0 ${accentBorder}`}>
        <GigForm action={editGig.bind(null, gig.id)} initial={gig} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  const warning = expenses.length > 0
    ? ` Its ${expenses.length} linked expense${expenses.length === 1 ? '' : 's'} will be kept but unlinked.`
    : ''

  const hasDetails = Boolean(gig.payment_method || gig.date_paid)

  function toggleExpanded(e) {
    if (e.key !== undefined && e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    setExpanded((v) => !v)
  }

  return (
    <div className={`mb-2.5 rounded-xl border-l-4 bg-ink-800 p-4 last:mb-0 ${accentBorder}`}>
      <div
        className={`flex flex-wrap items-center gap-3.5 text-sm ${hasDetails ? 'cursor-pointer rounded-lg hover:bg-white/[0.04]' : ''}`}
        onClick={hasDetails ? toggleExpanded : undefined}
        onKeyDown={hasDetails ? toggleExpanded : undefined}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        aria-expanded={hasDetails ? expanded : undefined}
      >
        {hasDetails && (
          <span
            className={`inline-block flex-none text-[0.6rem] text-white/40 transition-transform ${expanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            &#9656;
          </span>
        )}
        <span className="text-white/40">{displayNum}</span>
        <span className="text-white/70">{new Date(gig.gig_date).toLocaleDateString()}</span>
        <span className="font-bold text-white">{gig.client}</span>
        <span className="rounded-full border border-white/10 bg-ink-700 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white/50">
          {gig.gig_type === 'other' && gig.gig_type_other ? gig.gig_type_other : gig.gig_type}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide ${STATUS_STYLE[gig.status] || 'bg-white/10 text-white/60'}`}>
          {gig.status}
        </span>
        <span className="ml-auto font-bold text-white">${formatMoney(gig.gross_payment)}</span>
        <div
          className="flex gap-0.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="rounded px-2 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <form ref={formRef} action={removeGig.bind(null, gig.id)}>
            <button
              type="button"
              className="rounded px-2 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          </form>
        </div>
      </div>
      {expanded && hasDetails && (
        <div className="mt-2 text-sm text-white/55">
          {gig.payment_method && <div>Payment method: {gig.payment_method}</div>}
          {gig.date_paid && <div>Date paid: {new Date(gig.date_paid).toLocaleDateString()}</div>}
        </div>
      )}
      {Number(gig.mileage) > 0 && (
        <div className="mt-2 text-sm text-white/55">
          Mileage: {gig.mileage} mi &rarr; ${formatMoney(mileageDeduction(gig.gig_date, gig.mileage))} deduction (est.)
        </div>
      )}
      {gig.notes && <div className="mt-2 text-sm text-white/55">{gig.notes}</div>}
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
