'use client'

import { useState, useRef } from 'react'
import { categoryLabel, metaSummary } from './categories'
import { formatMoney, isPdfKey } from './format'
import ExpenseForm from './ExpenseForm'
import ConfirmModal from './ConfirmModal'
import ReceiptLightbox from './ReceiptLightbox'

export default function ExpenseLine({ expense, showDate, editExpense, removeExpense, recentGigs }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
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

  const linkedGig = expense.gig_id ? recentGigs.find((g) => g.id === expense.gig_id) : null
  const cartItems = expense.category === 'supplies' && Array.isArray(expense.meta?.items) ? expense.meta.items : null
  const receiptKeys = Array.isArray(expense.meta?.receiptKeys) && expense.meta.receiptKeys.length
    ? expense.meta.receiptKeys
    : (expense.receipt_url ? [expense.receipt_url] : [])
  const hasDetails = Boolean(
    expense.description || expense.recurring_monthly || receiptKeys.length > 0 || linkedGig || (cartItems && cartItems.length > 0)
  )
  const meta = metaSummary(expense.category, expense.meta)

  function toggleExpanded(e) {
    if (e.key !== undefined && e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    setExpanded((v) => !v)
  }

  return (
    <div className="mt-1.5 border-l-2 border-white/10 pl-3 first:mt-0">
      <div
        className={`flex flex-wrap items-center gap-3 py-1 text-sm text-white/70 ${hasDetails ? 'cursor-pointer rounded hover:bg-white/[0.04]' : ''}`}
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
        {showDate && <span>{new Date(expense.expense_date).toLocaleDateString()}</span>}
        <span>{categoryLabel(expense.category)}</span>
        <span>{expense.vendor || '—'}</span>
        <span className="ml-auto font-bold text-white">${formatMoney(expense.amount)}</span>
        <div
          className="ml-3 flex gap-0.5"
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
          <form ref={formRef} action={removeExpense.bind(null, expense.id)}>
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
      {meta && <div className="-mt-0.5 mb-1 text-xs italic text-white/35">{meta}</div>}
      {expanded && hasDetails && (
        <div className="mb-1.5 flex flex-col items-start gap-1.5 text-sm text-white/60">
          {cartItems && cartItems.length > 0 && (
            <div className="flex w-full flex-col gap-0.5">
              {cartItems.map((it, i) => (
                <div className="flex justify-between gap-4 text-sm" key={i}>
                  <span>{it.name || '—'}{it.capitalAsset ? ' · Capital asset' : ''}</span>
                  <span className="flex-none font-semibold text-white">${formatMoney(it.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {expense.description && <div>{expense.description}</div>}
          {linkedGig && (
            <div>Linked gig: {new Date(linkedGig.gig_date).toLocaleDateString()} — {linkedGig.client}</div>
          )}
          {expense.recurring_monthly && <div>Recurring monthly expense</div>}
          {receiptKeys.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {receiptKeys.map((key, i) => (
                isPdfKey(key) ? (
                  <a
                    key={key}
                    href={`/api/ledger/receipt?key=${encodeURIComponent(key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded px-2 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {receiptKeys.length > 1 ? `View receipt ${i + 1} (PDF)` : 'View receipt (PDF)'}
                  </a>
                ) : (
                  <button
                    key={key}
                    type="button"
                    className="rounded px-2 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={() => setLightboxIndex(i)}
                  >
                    {receiptKeys.length > 1 ? `View receipt ${i + 1}` : 'View receipt'}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      )}
      <ReceiptLightbox
        src={lightboxIndex !== null && receiptKeys[lightboxIndex] ? `/api/ledger/receipt?key=${encodeURIComponent(receiptKeys[lightboxIndex])}` : null}
        onClose={() => setLightboxIndex(null)}
      />
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
