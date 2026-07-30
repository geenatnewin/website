'use client'

import { useState } from 'react'
import { GIG_TYPES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from './categories'

export default function AddForms({ addGig, addExpense, recentGigs }) {
  const [openForm, setOpenForm] = useState(null) // null | 'gig' | 'expense'
  const [gigType, setGigType] = useState('photography')
  const [paymentMethod, setPaymentMethod] = useState('Venmo')
  const isPaymentOther = paymentMethod === 'Other'
  const [venueAddress, setVenueAddress] = useState('')
  const [mileage, setMileage] = useState('')
  const [calcStatus, setCalcStatus] = useState('idle') // idle | loading | error
  const [calcError, setCalcError] = useState('')

  async function calculateMileage() {
    if (!venueAddress.trim()) return
    setCalcStatus('loading')
    setCalcError('')
    try {
      const res = await fetch(`/api/ledger/mileage?address=${encodeURIComponent(venueAddress)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not calculate mileage')
      setMileage(String(data.miles))
      setCalcStatus('idle')
    } catch (err) {
      setCalcStatus('error')
      setCalcError(err.message)
    }
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

      {openForm === 'gig' && (
        <form action={addGig} className="ldg-form">
          <p className="ldg-form-title">FIG. 1 — Add gig</p>

          <div className="ldg-field">
            <label htmlFor="gigDate">Date</label>
            <input type="date" id="gigDate" name="gigDate" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="client">Client / venue</label>
            <input type="text" id="client" name="client" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="gigType">Type</label>
            <select id="gigType" name="gigType" value={gigType} onChange={(e) => setGigType(e.target.value)}>
              {GIG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {gigType === 'other' && (
            <div className="ldg-field">
              <label htmlFor="gigTypeOther">Specify type</label>
              <input type="text" id="gigTypeOther" name="gigTypeOther" placeholder="e.g. photo booth, drone footage…" />
            </div>
          )}

          <div className="ldg-field">
            <label htmlFor="grossPayment">Gross payment ($)</label>
            <input type="number" step="0.01" min="0" id="grossPayment" name="grossPayment" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="paymentMethod">Payment method</label>
            <select
              id="paymentMethod"
              name={isPaymentOther ? undefined : 'paymentMethod'}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {isPaymentOther && (
            <div className="ldg-field">
              <label htmlFor="paymentMethodOther">Specify payment method</label>
              <input type="text" id="paymentMethodOther" name="paymentMethod" placeholder="e.g. wire transfer" />
            </div>
          )}

          <div className="ldg-field">
            <label htmlFor="datePaid">Date paid</label>
            <input type="date" id="datePaid" name="datePaid" />
          </div>

          <div className="ldg-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="paid">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="venueAddress">Venue address (optional)</label>
            <div className="ldg-inline-field">
              <input
                type="text"
                id="venueAddress"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="123 Main St, City, State ZIP"
              />
              <button
                type="button"
                className="ldg-btn ldg-btn-calc"
                onClick={calculateMileage}
                disabled={calcStatus === 'loading' || !venueAddress.trim()}
              >
                {calcStatus === 'loading' ? '…' : 'Calculate'}
              </button>
            </div>
            {calcStatus === 'error' && <p className="ldg-hint ldg-hint-error">{calcError}</p>}
          </div>

          <div className="ldg-field">
            <label htmlFor="mileage">Mileage (round trip)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              id="mileage"
              name="mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g. 24"
            />
            <p className="ldg-hint">Auto-fills from the address above (round trip from home), or just type your own estimate.</p>
          </div>

          <div className="ldg-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" placeholder="e.g. deliverables, turnaround time…" />
          </div>

          <button type="submit" className="ldg-btn ldg-btn-submit">Add gig</button>
        </form>
      )}

      {openForm === 'expense' && (
        <form action={addExpense} className="ldg-form">
          <p className="ldg-form-title">FIG. 2 — Add expense</p>

          <div className="ldg-field">
            <label htmlFor="expenseDate">Date</label>
            <input type="date" id="expenseDate" name="expenseDate" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="supplies">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="gigId">Linked gig</label>
            <select id="gigId" name="gigId" defaultValue="">
              <option value="">General (not tied to a gig)</option>
              {recentGigs.map((g) => (
                <option key={g.id} value={g.id}>
                  {new Date(g.gig_date).toLocaleDateString()} — {g.client}
                </option>
              ))}
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="amount">Amount ($)</label>
            <input type="number" step="0.01" min="0" id="amount" name="amount" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="vendor">Vendor</label>
            <input type="text" id="vendor" name="vendor" />
          </div>

          <div className="ldg-field">
            <label htmlFor="description">Description</label>
            <input type="text" id="description" name="description" />
          </div>

          <button type="submit" className="ldg-btn ldg-btn-submit">Add expense</button>
        </form>
      )}
    </section>
  )
}
