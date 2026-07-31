'use client'

import { useState } from 'react'
import { GIG_TYPES, PAYMENT_METHODS } from './categories'
import { Field, fieldInput, fieldHintError, formCard, formTitle, submitBtn, cancelBtn, calcBtn } from './FormField'

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
    <form action={action} className={formCard}>
      <p className={formTitle}>{isEdit ? 'Edit gig' : 'FIG. 1 — Add gig'}</p>

      <Field label="Date" htmlFor="gigDate">
        <input
          type="date"
          id="gigDate"
          name="gigDate"
          className={fieldInput}
          defaultValue={toDateInput(initial?.gig_date)}
          onClick={openDatePicker}
          required
        />
      </Field>

      <Field label="Client / venue" htmlFor="client">
        <input type="text" id="client" name="client" className={fieldInput} defaultValue={initial?.client || ''} required />
      </Field>

      <Field label="Type" htmlFor="gigType">
        <select id="gigType" name="gigType" className={fieldInput} value={gigType} onChange={(e) => setGigType(e.target.value)}>
          {GIG_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>

      {gigType === 'other' && (
        <Field label="Specify type" htmlFor="gigTypeOther">
          <input
            type="text"
            id="gigTypeOther"
            name="gigTypeOther"
            className={fieldInput}
            defaultValue={initial?.gig_type_other || ''}
            placeholder="e.g. photo booth, drone footage…"
          />
        </Field>
      )}

      <Field label="Gross payment ($)" htmlFor="grossPayment">
        <input
          type="number"
          step="0.01"
          min="0"
          id="grossPayment"
          name="grossPayment"
          className={fieldInput}
          defaultValue={initial?.gross_payment ?? ''}
          required
        />
      </Field>

      <Field label="Payment method" htmlFor="paymentMethod">
        <select
          id="paymentMethod"
          name={isPaymentOther ? undefined : 'paymentMethod'}
          className={fieldInput}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
          <option value="Other">Other</option>
        </select>
      </Field>

      {isPaymentOther && (
        <Field label="Specify payment method" htmlFor="paymentMethodOther">
          <input
            type="text"
            id="paymentMethodOther"
            name="paymentMethod"
            className={fieldInput}
            defaultValue={isKnownMethod ? '' : initial?.payment_method || ''}
            placeholder="e.g. wire transfer"
          />
        </Field>
      )}

      <Field label="Date paid" htmlFor="datePaid">
        <input
          type="date"
          id="datePaid"
          name="datePaid"
          className={fieldInput}
          defaultValue={toDateInput(initial?.date_paid)}
          onClick={openDatePicker}
        />
      </Field>

      <Field label="Status" htmlFor="status">
        <select id="status" name="status" className={fieldInput} defaultValue={initial?.status || 'paid'}>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </Field>

      <Field
        label="Venue address (optional)"
        htmlFor="venueAddress"
        hint={calcStatus === 'error' ? calcError : undefined}
        hintClassName={fieldHintError}
      >
        <div className="flex gap-2">
          <input
            type="text"
            id="venueAddress"
            className={fieldInput}
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            placeholder="123 Main St, City, State ZIP"
          />
          <button
            type="button"
            className={calcBtn}
            onClick={calculateMileage}
            disabled={calcStatus === 'loading' || !venueAddress.trim()}
          >
            {calcStatus === 'loading' ? '…' : 'Calculate'}
          </button>
        </div>
      </Field>

      <Field
        label="Mileage (round trip)"
        htmlFor="mileage"
        hint="Auto-fills from the address above (round trip from home), or just type your own estimate."
      >
        <input
          type="number"
          step="0.1"
          min="0"
          id="mileage"
          name="mileage"
          className={fieldInput}
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          placeholder="e.g. 24"
        />
      </Field>

      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          className={`${fieldInput} min-h-[70px] resize-y`}
          defaultValue={initial?.notes || ''}
          placeholder="e.g. deliverables, turnaround time…"
        />
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" className={submitBtn}>{isEdit ? 'Save changes' : 'Add gig'}</button>
        {isEdit && (
          <button type="button" className={cancelBtn} onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
