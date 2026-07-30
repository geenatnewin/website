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

  function toggleExpanded(e) {
    if (e.key !== undefined && e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    setExpanded((v) => !v)
  }

  return (
    <div>
      <div
        className={`ldg-expense-row ${hasDetails ? 'ldg-row-expandable' : ''}`}
        onClick={hasDetails ? toggleExpanded : undefined}
        onKeyDown={hasDetails ? toggleExpanded : undefined}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        aria-expanded={hasDetails ? expanded : undefined}
      >
        {hasDetails && (
          <span className={`ldg-row-chevron ${expanded ? 'ldg-row-chevron-open' : ''}`} aria-hidden="true">▸</span>
        )}
        {showDate && <span>{new Date(expense.expense_date).toLocaleDateString()}</span>}
        <span>{categoryLabel(expense.category)}</span>
        <span>{expense.vendor || '—'}</span>
        <span className="ldg-expense-amount">${formatMoney(expense.amount)}</span>
        <div
          className="ldg-entry-controls ldg-entry-controls-sm"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button type="button" className="ldg-icon-btn" onClick={() => setEditing(true)}>Edit</button>
          <form ref={formRef} action={removeExpense.bind(null, expense.id)}>
            <button type="button" className="ldg-icon-btn ldg-icon-btn-danger" onClick={() => setConfirming(true)}>Delete</button>
          </form>
        </div>
      </div>
      {metaSummary(expense.category, expense.meta) && (
        <div className="ldg-expense-meta">{metaSummary(expense.category, expense.meta)}</div>
      )}
      {expanded && hasDetails && (
        <div className="ldg-expense-details">
          {cartItems && cartItems.length > 0 && (
            <div className="ldg-expense-items">
              {cartItems.map((it, i) => (
                <div className="ldg-expense-item-row" key={i}>
                  <span>{it.name || '—'}{it.capitalAsset ? ' · Capital asset' : ''}</span>
                  <span>${formatMoney(it.amount)}</span>
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
            <div className="ldg-expense-receipts">
              {receiptKeys.map((key, i) => (
                isPdfKey(key) ? (
                  <a
                    key={key}
                    href={`/api/ledger/receipt?key=${encodeURIComponent(key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ldg-icon-btn ldg-expense-details-receipt"
                  >
                    {receiptKeys.length > 1 ? `View receipt ${i + 1} (PDF)` : 'View receipt (PDF)'}
                  </a>
                ) : (
                  <button
                    key={key}
                    type="button"
                    className="ldg-icon-btn ldg-expense-details-receipt"
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
