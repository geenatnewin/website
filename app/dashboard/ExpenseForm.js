'use client'

import { useRef, useState } from 'react'
import { EXPENSE_CATEGORIES, categoryConfig } from './categories'
import ReceiptLightbox from './ReceiptLightbox'

function toDateInput(value) {
  if (!value) return ''
  const s = typeof value === 'string' ? value : new Date(value).toISOString()
  return s.slice(0, 10)
}

export default function ExpenseForm({ action, initial, recentGigs, onCancel }) {
  const isEdit = Boolean(initial)
  const [expenseCategory, setExpenseCategory] = useState(initial?.category || 'supplies')
  const expenseCategoryConfig = categoryConfig(expenseCategory)
  const isInsurance = expenseCategory === 'insurance'
  const isMealsBulk = !isEdit && expenseCategory === 'meals'
  const isSuppliesBulk = !isEdit && expenseCategory === 'supplies'
  const showReceiptUpload = expenseCategory === 'supplies' || expenseCategory === 'meals'

  const [billingFrequency, setBillingFrequency] = useState(initial?.meta?.billingFrequency || 'Monthly')

  const [mealRows, setMealRows] = useState([{ vendor: '', amount: '' }])
  function updateMealRow(index, field, value) {
    setMealRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }
  function addMealRow() {
    setMealRows((rows) => [...rows, { vendor: '', amount: '' }])
  }
  function removeMealRow(index) {
    setMealRows((rows) => rows.filter((_, i) => i !== index))
  }

  const [supplyRows, setSupplyRows] = useState([{ item: '', amount: '', capitalAsset: false }])
  function updateSupplyRow(index, field, value) {
    setSupplyRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }
  function addSupplyRow() {
    setSupplyRows((rows) => [...rows, { item: '', amount: '', capitalAsset: false }])
  }
  function removeSupplyRow(index) {
    setSupplyRows((rows) => rows.filter((_, i) => i !== index))
  }

  const vendorRef = useRef(null)
  const expenseDateRef = useRef(null)
  const amountRef = useRef(null)
  const extraFieldRefs = useRef({})
  const [receiptKey, setReceiptKey] = useState(initial?.receipt_url || '')
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  // receiptPreview is a fresh local blob (this session's upload); once saved, fall
  // back to the signed-URL endpoint so a previously-attached receipt is viewable too.
  const receiptViewSrc = receiptPreview || (receiptKey ? `/api/ledger/receipt?key=${encodeURIComponent(receiptKey)}` : null)

  async function handleReceiptChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptPreview(URL.createObjectURL(file))
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const body = new FormData()
      body.append('receipt', file)
      const res = await fetch('/api/ledger/analyze-receipt', { method: 'POST', body })
      const data = await res.json()
      if (data.receiptKey) setReceiptKey(data.receiptKey)
      if (!res.ok) throw new Error(data.error || 'Could not read the receipt')

      if (data.vendor && vendorRef.current) vendorRef.current.value = data.vendor
      if (data.date && expenseDateRef.current) expenseDateRef.current.value = data.date

      if (isSuppliesBulk && data.items?.length) {
        setSupplyRows(data.items.map((it) => ({ item: it.description, amount: String(it.amount), capitalAsset: false })))
      } else if (isMealsBulk && data.items?.length) {
        // A receipt is one meal transaction, even if it itemizes several food items —
        // sum them into a single meal row rather than splitting into separate expenses.
        const total = data.items.reduce((sum, it) => sum + it.amount, 0)
        setMealRows((rows) => {
          const updated = [...rows]
          updated[0] = { vendor: data.vendor || updated[0].vendor, amount: String(total) }
          return updated
        })
      } else if (!isSuppliesBulk && !isMealsBulk && data.items?.length) {
        const first = data.items[0]
        if (amountRef.current) amountRef.current.value = String(first.amount)
        if (extraFieldRefs.current.item) extraFieldRefs.current.item.value = first.description
      }
    } catch (err) {
      setAnalyzeError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <form action={action} className="ldg-form">
      <p className="ldg-form-title">{isEdit ? 'Edit expense' : 'FIG. 2 — Add expense'}</p>

      <div className="ldg-field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={expenseCategory}
          onChange={(e) => setExpenseCategory(e.target.value)}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {expenseCategoryConfig?.hint && <p className="ldg-hint">{expenseCategoryConfig.hint}</p>}
      </div>

      {!isInsurance && (
        <div className="ldg-field">
          <label htmlFor="expenseDate">Date</label>
          <input
            type="date"
            id="expenseDate"
            name="expenseDate"
            ref={expenseDateRef}
            defaultValue={toDateInput(initial?.expense_date)}
            onClick={(e) => e.target.showPicker?.()}
            required
          />
        </div>
      )}

      <div className="ldg-field">
        <label htmlFor="gigId">Linked gig</label>
        <select id="gigId" name="gigId" defaultValue={initial?.gig_id || ''}>
          <option value="">General (not tied to a gig)</option>
          {recentGigs.map((g) => (
            <option key={g.id} value={g.id}>
              {new Date(g.gig_date).toLocaleDateString()} — {g.client}
            </option>
          ))}
        </select>
      </div>

      {showReceiptUpload && (
        <div className="ldg-field">
          <label htmlFor="receiptPhoto">Receipt Photo (optional)</label>
          <input
            type="file"
            id="receiptPhoto"
            accept="image/*"
            onChange={handleReceiptChange}
          />
          {receiptViewSrc && (
            <button
              type="button"
              className="ldg-receipt-preview-btn"
              onClick={() => setLightboxOpen(true)}
              aria-label="View full-size receipt"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={receiptViewSrc} alt="Receipt preview" className="ldg-receipt-preview" />
            </button>
          )}
          {analyzing && <p className="ldg-hint">Reading receipt…</p>}
          {analyzeError && <p className="ldg-hint ldg-hint-error">{analyzeError}</p>}
          {receiptKey && !analyzing && (
            <p className="ldg-hint">✓ Receipt attached — tap the photo to view it full-size. Double-check the fields below before submitting.</p>
          )}
          <input type="hidden" name="receiptKey" value={receiptKey} readOnly />
        </div>
      )}
      <ReceiptLightbox src={lightboxOpen ? receiptViewSrc : null} onClose={() => setLightboxOpen(false)} />

      {isMealsBulk ? (
        <div className="ldg-field">
          <label>Meals</label>
          {mealRows.map((row, i) => (
            <div className="ldg-meal-row" key={i}>
              <input
                type="text"
                placeholder="Restaurant"
                name="mealVendor"
                value={row.vendor}
                onChange={(e) => updateMealRow(i, 'vendor', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                className="ldg-meal-amount"
                name="mealAmount"
                value={row.amount}
                onChange={(e) => updateMealRow(i, 'amount', e.target.value)}
                required={i === 0}
              />
              {mealRows.length > 1 && (
                <button
                  type="button"
                  className="ldg-icon-btn ldg-icon-btn-danger"
                  onClick={() => removeMealRow(i)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="ldg-btn ldg-btn-calc" onClick={addMealRow}>+ Add another meal</button>
          <p className="ldg-hint">One row per meal (breakfast, lunch, dinner…) — each is logged as its own expense line.</p>
        </div>
      ) : isSuppliesBulk ? (
        <>
          <div className="ldg-field">
            <label htmlFor="vendor">{expenseCategoryConfig?.vendorLabel || 'Vendor'}</label>
            <input type="text" id="vendor" name="vendor" ref={vendorRef} defaultValue={initial?.vendor || ''} />
          </div>

          <div className="ldg-field">
            <label>Items</label>
            {supplyRows.map((row, i) => (
              <div key={i}>
                <div className="ldg-meal-row">
                  <input
                    type="text"
                    placeholder="Item / equipment"
                    name="supplyItem"
                    value={row.item}
                    onChange={(e) => updateSupplyRow(i, 'item', e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount"
                    className="ldg-meal-amount"
                    name="supplyAmount"
                    value={row.amount}
                    onChange={(e) => updateSupplyRow(i, 'amount', e.target.value)}
                    required={i === 0}
                  />
                  <label className="ldg-checkbox-field ldg-row-checkbox">
                    <input
                      type="checkbox"
                      checked={row.capitalAsset}
                      onChange={(e) => updateSupplyRow(i, 'capitalAsset', e.target.checked)}
                    />
                    Capital asset
                  </label>
                  <input type="hidden" name="supplyCapitalAsset" value={row.capitalAsset ? 'true' : 'false'} />
                  {supplyRows.length > 1 && (
                    <button
                      type="button"
                      className="ldg-icon-btn ldg-icon-btn-danger"
                      onClick={() => removeSupplyRow(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {Number(row.amount) > 2500 && !row.capitalAsset && (
                  <p className="ldg-hint ldg-hint-warning">Over $2,500 — consider flagging this as a capital asset.</p>
                )}
              </div>
            ))}
            <button type="button" className="ldg-btn ldg-btn-calc" onClick={addSupplyRow}>+ Add another item</button>
            <p className="ldg-hint">One row per item — each is logged as its own expense line.</p>
          </div>
        </>
      ) : (
        <>
          <div className="ldg-field">
            <label htmlFor="amount">Amount ($)</label>
            <input type="number" step="0.01" min="0" id="amount" name="amount" ref={amountRef} defaultValue={initial?.amount ?? ''} required />
          </div>

          <div className="ldg-field">
            <label htmlFor="vendor">{expenseCategoryConfig?.vendorLabel || 'Vendor'}</label>
            <input type="text" id="vendor" name="vendor" ref={vendorRef} defaultValue={initial?.vendor || ''} />
          </div>

          <label className="ldg-checkbox-field">
            <input type="checkbox" name="recurringMonthly" value="true" defaultChecked={Boolean(initial?.recurring_monthly)} />
            Recurring monthly expense (e.g. a software subscription)
          </label>
        </>
      )}

      {isInsurance && (
        <>
          <div className="ldg-field">
            <label htmlFor="policyType">Policy type</label>
            <input
              type="text"
              id="policyType"
              name="policyType"
              defaultValue={initial?.meta?.policyType || ''}
              placeholder="Liability, equipment, health…"
            />
          </div>

          <div className="ldg-field">
            <label htmlFor="billingFrequency">Billing frequency</label>
            <select
              id="billingFrequency"
              name="billingFrequency"
              value={billingFrequency}
              onChange={(e) => setBillingFrequency(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="effectiveStart">Effective start date</label>
            <input
              type="date"
              id="effectiveStart"
              name="effectiveStart"
              defaultValue={toDateInput(initial?.meta?.effectiveStart)}
              onClick={(e) => e.target.showPicker?.()}
              required
            />
          </div>

          {billingFrequency === 'Monthly' ? (
            <div className="ldg-field">
              <label htmlFor="effectiveEnd">Effective end date</label>
              <input
                type="date"
                id="effectiveEnd"
                name="effectiveEnd"
                defaultValue={toDateInput(initial?.meta?.effectiveEnd)}
                onClick={(e) => e.target.showPicker?.()}
                required
              />
            </div>
          ) : (
            <p className="ldg-hint">End date is automatically set to 12 months after the start date.</p>
          )}
        </>
      )}

      {!isInsurance && !isSuppliesBulk && expenseCategoryConfig?.extraFields?.map((field) => {
        const fieldDefault = initial?.meta?.[field.name] ?? field.defaultValue

        if (field.type === 'checkbox') {
          return (
            <label className="ldg-checkbox-field" key={field.name}>
              <input type="checkbox" name={field.name} value="true" defaultChecked={fieldDefault === 'true'} />
              {field.label}
            </label>
          )
        }

        return (
          <div className="ldg-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === 'select' ? (
              <select id={field.name} name={field.name} defaultValue={fieldDefault}>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                id={field.name}
                name={field.name}
                ref={(el) => { extraFieldRefs.current[field.name] = el }}
                placeholder={field.placeholder}
                defaultValue={fieldDefault}
                required={field.required}
                {...(field.type === 'number' ? { min: 0, max: 100, step: 1 } : {})}
              />
            )}
          </div>
        )
      })}

      <div className="ldg-field">
        <label htmlFor="description">Description</label>
        <input type="text" id="description" name="description" defaultValue={initial?.description || ''} />
      </div>

      <div className="ldg-form-actions">
        <button type="submit" className="ldg-btn ldg-btn-submit">{isEdit ? 'Save changes' : 'Add expense'}</button>
        {isEdit && (
          <button type="button" className="ldg-btn ldg-btn-cancel" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
