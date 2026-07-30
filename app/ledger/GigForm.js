'use client'

import { useState } from 'react'
import { GIG_TYPES, PAYMENT_METHODS } from './categories'

function toDateInput(value) {
  if (!value) return ''
  const s = typeof value === 'string' ? value : new Date(value).toISOString()
  return s.slice(0, 10)
}

export default function GigForm({ action, initial, onCancel }) {
  const isEdit = Boolean(initial)
  const [gigType, setGigType] = useState(initial?.gig_type || 'photography')
  const initialPaymentMethod = initial?.payment_method || 'Venmo'
  const isKnownMethod = PAYMENT_METHODS.includes(initialPaymentMethod)
  const [paymentMethod, setPaymentMethod] = useState(isKnownMethod ? initialPaymentMethod : 'Other')
  const isPaymentOther = paymentMethod === 'Other'
  const [venueAddress, setVenueAddress] = useState('')
  const [mileage, setMileage] = useState(initial?.mileage != null ? String(Number(initial.mileage)) : '')
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

  function openDatePicker(e) {
    e.target.showPicker?.()
  }

  return (
    <form action={action} className="ldg-form">
      <p className="ldg-form-title">{isEdit ? 'Edit gig' : 'FIG. 1 — Add gig'}</p>

      <div className="ldg-field">
        <label htmlFor="gigDate">Date</label>
        <input
          type="date"
          id="gigDate"
          name="gigDate"
          defaultValue={toDateInput(initial?.gig_date)}
          onClick={openDatePicker}
          required
        />
      </div>

      <div className="ldg-field">
        <label htmlFor="client">Client / venue</label>
        <input type="text" id="client" name="client" defaultValue={initial?.client || ''} required />
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
          <input
            type="text"
            id="gigTypeOther"
            name="gigTypeOther"
            defaultValue={initial?.gig_type_other || ''}
            placeholder="e.g. photo booth, drone footage…"
          />
        </div>
      )}

      <div className="ldg-field">
        <label htmlFor="grossPayment">Gross payment ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          id="grossPayment"
          name="grossPayment"
          defaultValue={initial?.gross_payment ?? ''}
          required
        />
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
          <input
            type="text"
            id="paymentMethodOther"
            name="paymentMethod"
            defaultValue={isKnownMethod ? '' : initial?.payment_method || ''}
            placeholder="e.g. wire transfer"
          />
        </div>
      )}

      <div className="ldg-field">
        <label htmlFor="datePaid">Date paid</label>
        <input
          type="date"
          id="datePaid"
          name="datePaid"
          defaultValue={toDateInput(initial?.date_paid)}
          onClick={openDatePicker}
        />
      </div>

      <div className="ldg-field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={initial?.status || 'paid'}>
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
        <textarea id="notes" name="notes" defaultValue={initial?.notes || ''} placeholder="e.g. deliverables, turnaround time…" />
      </div>

      <div className="ldg-form-actions">
        <button type="submit" className="ldg-btn ldg-btn-submit">{isEdit ? 'Save changes' : 'Add gig'}</button>
        {isEdit && (
          <button type="button" className="ldg-btn ldg-btn-cancel" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
