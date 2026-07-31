'use client'

import { useRef, useState } from 'react'
import { EXPENSE_CATEGORIES, categoryConfig } from './categories'
import { isPdfKey } from './format'
import ReceiptLightbox from './ReceiptLightbox'
import {
  Field,
  fieldInput,
  fieldHint,
  fieldHintError,
  fieldHintWarning,
  formCard,
  formTitle,
  submitBtn,
  cancelBtn,
  calcBtn,
  checkboxLabel,
  iconBtnDanger,
} from './FormField'

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
  // Supplies always uses the itemized-cart UI, on add AND edit, so a multi-item
  // purchase stays one expense with a per-item breakdown instead of splitting apart.
  const isSuppliesBulk = expenseCategory === 'supplies'
  const showReceiptUpload = !isInsurance

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

  const [supplyRows, setSupplyRows] = useState(() => {
    if (initial?.category === 'supplies') {
      if (Array.isArray(initial?.meta?.items) && initial.meta.items.length) {
        return initial.meta.items.map((it) => ({
          item: it.name || '',
          amount: String(it.amount ?? ''),
          capitalAsset: Boolean(it.capitalAsset),
        }))
      }
      // Legacy single-item format from before carts were combined into one expense.
      if (initial?.meta?.item) {
        return [{ item: initial.meta.item, amount: String(initial.amount ?? ''), capitalAsset: initial.meta.capitalAsset === 'true' }]
      }
    }
    return [{ item: '', amount: '', capitalAsset: false }]
  })
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
  const descriptionRef = useRef(null)
  const extraFieldRefs = useRef({})

  // Photos picked but not yet scanned — reviewed/removable before spending an API call.
  const [pendingFiles, setPendingFiles] = useState([])
  // Keys of photos already uploaded+scanned (from a prior scan this session, or from
  // editing an existing expense). First key doubles as the legacy receipt_url column.
  const [receiptKeys, setReceiptKeys] = useState(() => {
    if (Array.isArray(initial?.meta?.receiptKeys) && initial.meta.receiptKeys.length) return initial.meta.receiptKeys
    return initial?.receipt_url ? [initial.receipt_url] : []
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
    setAnalyzeError('')
    e.target.value = '' // lets the same file (or more) be picked again
  }

  function removePendingFile(id) {
    setPendingFiles((prev) => {
      const removed = prev.find((f) => f.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }

  async function scanReceipts() {
    if (!pendingFiles.length) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const body = new FormData()
      pendingFiles.forEach(({ file }) => body.append('receipt', file))
      const res = await fetch('/api/ledger/analyze-receipt', { method: 'POST', body })
      const data = await res.json()
      if (Array.isArray(data.receiptKeys) && data.receiptKeys.length) setReceiptKeys(data.receiptKeys)
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
        // Multiple line items on a receipt for a category without per-item tracking —
        // use the combined total and fold the item names into the description.
        const total = data.items.reduce((sum, it) => sum + it.amount, 0)
        if (amountRef.current) amountRef.current.value = String(Math.round(total * 100) / 100)
        if (descriptionRef.current && !descriptionRef.current.value) {
          descriptionRef.current.value = data.items.map((it) => it.description).join(', ')
        }
      }

      pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
      setPendingFiles([])
    } catch (err) {
      setAnalyzeError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <form action={action} className={formCard}>
      <p className={formTitle}>{isEdit ? 'Edit expense' : 'FIG. 2 — Add expense'}</p>

      <Field label="Category" htmlFor="category" hint={expenseCategoryConfig?.hint}>
        <select
          id="category"
          name="category"
          className={fieldInput}
          value={expenseCategory}
          onChange={(e) => setExpenseCategory(e.target.value)}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </Field>

      {!isInsurance && (
        <Field label="Date" htmlFor="expenseDate">
          <input
            type="date"
            id="expenseDate"
            name="expenseDate"
            className={fieldInput}
            ref={expenseDateRef}
            defaultValue={toDateInput(initial?.expense_date)}
            onClick={(e) => e.target.showPicker?.()}
            required
          />
        </Field>
      )}

      <Field label="Linked gig" htmlFor="gigId">
        <select id="gigId" name="gigId" className={fieldInput} defaultValue={initial?.gig_id || ''}>
          <option value="">General (not tied to a gig)</option>
          {recentGigs.map((g) => (
            <option key={g.id} value={g.id}>
              {new Date(g.gig_date).toLocaleDateString()} — {g.client}
            </option>
          ))}
        </select>
      </Field>

      {showReceiptUpload && (
        <Field label="Receipt Photo or PDF (optional, one or more)" htmlFor="receiptPhoto">
          <input
            type="file"
            id="receiptPhoto"
            accept="image/*,application/pdf"
            multiple
            className="block w-full text-sm text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-700 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-white/70 hover:file:text-white"
            onChange={handleFilesSelected}
          />

          {pendingFiles.length > 0 && (
            <>
              <div className="mt-2 flex flex-wrap items-start gap-2.5">
                {pendingFiles.map((f) => (
                  <div key={f.id} className="flex flex-col items-center gap-1">
                    {f.file.type === 'application/pdf' ? (
                      <div
                        className="flex h-[72px] w-[72px] items-center justify-center rounded-lg border border-white/10 bg-ink-700 text-center text-xs font-bold tracking-wide text-white/50"
                        title={f.file.name}
                      >
                        PDF
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.previewUrl} alt={f.file.name} className="h-[72px] w-[72px] rounded-lg border border-white/10 object-cover" />
                    )}
                    <button type="button" className={iconBtnDanger} onClick={() => removePendingFile(f.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={`mt-2 ${calcBtn}`} onClick={scanReceipts} disabled={analyzing}>
                {analyzing ? 'Scanning…' : `Scan ${pendingFiles.length} file${pendingFiles.length === 1 ? '' : 's'}`}
              </button>
              <p className={fieldHint}>Remove anything that shouldn't be here first — scanning is what actually reads the file(s) and costs an API call.</p>
            </>
          )}

          {analyzeError && <p className={fieldHintError}>{analyzeError}</p>}

          {receiptKeys.length > 0 && !analyzing && (
            <>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {receiptKeys.map((key, i) => (
                  isPdfKey(key) ? (
                    <a
                      key={key}
                      href={`/api/ledger/receipt?key=${encodeURIComponent(key)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-[72px] w-[72px] items-center justify-center rounded-lg border border-white/10 bg-ink-700 text-center text-xs font-bold tracking-wide text-white/50 hover:text-white transition-colors"
                    >
                      PDF
                    </a>
                  ) : (
                    <button
                      key={key}
                      type="button"
                      className="rounded-lg p-0 hover:opacity-85 transition-opacity"
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`View receipt photo ${i + 1} full-size`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/ledger/receipt?key=${encodeURIComponent(key)}`} alt={`Receipt ${i + 1}`} className="h-[72px] w-[72px] rounded-lg border border-white/10 object-cover" />
                    </button>
                  )
                ))}
              </div>
              <p className={fieldHint}>
                &#10003; {receiptKeys.length} receipt file{receiptKeys.length === 1 ? '' : 's'} attached — tap to view. Double-check the fields below before submitting.
              </p>
            </>
          )}

          {receiptKeys.map((key) => (
            <input key={key} type="hidden" name="receiptKey" value={key} readOnly />
          ))}
        </Field>
      )}
      <ReceiptLightbox
        src={lightboxIndex !== null && receiptKeys[lightboxIndex] ? `/api/ledger/receipt?key=${encodeURIComponent(receiptKeys[lightboxIndex])}` : null}
        onClose={() => setLightboxIndex(null)}
      />

      {isMealsBulk ? (
        <Field label="Meals" hint="One row per meal (breakfast, lunch, dinner…) — each is logged as its own expense line.">
          {mealRows.map((row, i) => (
            <div className="mb-2 flex items-center gap-2" key={i}>
              <input
                type="text"
                placeholder="Restaurant"
                name="mealVendor"
                className={`${fieldInput} flex-1`}
                value={row.vendor}
                onChange={(e) => updateMealRow(i, 'vendor', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                className={`${fieldInput} w-[100px] flex-none`}
                name="mealAmount"
                value={row.amount}
                onChange={(e) => updateMealRow(i, 'amount', e.target.value)}
                required={i === 0}
              />
              {mealRows.length > 1 && (
                <button type="button" className={`flex-none ${iconBtnDanger}`} onClick={() => removeMealRow(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className={calcBtn} onClick={addMealRow}>+ Add another meal</button>
        </Field>
      ) : isSuppliesBulk ? (
        <>
          <Field label={expenseCategoryConfig?.vendorLabel || 'Vendor'} htmlFor="vendor">
            <input type="text" id="vendor" name="vendor" className={fieldInput} ref={vendorRef} defaultValue={initial?.vendor || ''} />
          </Field>

          <Field
            label="Items"
            hint="One row per item in this purchase — they're saved together as a single expense, itemized (click the entry afterward to see the breakdown)."
          >
            {supplyRows.map((row, i) => (
              <div key={i} className="mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Item / equipment"
                    name="supplyItem"
                    className={`${fieldInput} min-w-[140px] flex-1`}
                    value={row.item}
                    onChange={(e) => updateSupplyRow(i, 'item', e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount"
                    className={`${fieldInput} w-[100px] flex-none`}
                    name="supplyAmount"
                    value={row.amount}
                    onChange={(e) => updateSupplyRow(i, 'amount', e.target.value)}
                    required={i === 0}
                  />
                  <label className={`flex-none whitespace-nowrap ${checkboxLabel}`}>
                    <input
                      type="checkbox"
                      checked={row.capitalAsset}
                      onChange={(e) => updateSupplyRow(i, 'capitalAsset', e.target.checked)}
                    />
                    Capital asset
                  </label>
                  <input type="hidden" name="supplyCapitalAsset" value={row.capitalAsset ? 'true' : 'false'} />
                  {supplyRows.length > 1 && (
                    <button type="button" className={`flex-none ${iconBtnDanger}`} onClick={() => removeSupplyRow(i)}>
                      Remove
                    </button>
                  )}
                </div>
                {Number(row.amount) > 2500 && !row.capitalAsset && (
                  <p className={`mt-1 ${fieldHintWarning}`}>Over $2,500 — consider flagging this as a capital asset.</p>
                )}
              </div>
            ))}
            <button type="button" className={calcBtn} onClick={addSupplyRow}>+ Add another item</button>
          </Field>
        </>
      ) : (
        <>
          <Field label="Amount ($)" htmlFor="amount">
            <input type="number" step="0.01" min="0" id="amount" name="amount" className={fieldInput} ref={amountRef} defaultValue={initial?.amount ?? ''} required />
          </Field>

          <Field label={expenseCategoryConfig?.vendorLabel || 'Vendor'} htmlFor="vendor">
            <input type="text" id="vendor" name="vendor" className={fieldInput} ref={vendorRef} defaultValue={initial?.vendor || ''} />
          </Field>

          <label className={checkboxLabel}>
            <input type="checkbox" name="recurringMonthly" value="true" defaultChecked={Boolean(initial?.recurring_monthly)} />
            Recurring monthly expense (e.g. a software subscription)
          </label>
        </>
      )}

      {isInsurance && (
        <>
          <Field label="Policy type" htmlFor="policyType">
            <input
              type="text"
              id="policyType"
              name="policyType"
              className={fieldInput}
              defaultValue={initial?.meta?.policyType || ''}
              placeholder="Liability, equipment, health…"
            />
          </Field>

          <Field label="Billing frequency" htmlFor="billingFrequency">
            <select
              id="billingFrequency"
              name="billingFrequency"
              className={fieldInput}
              value={billingFrequency}
              onChange={(e) => setBillingFrequency(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
            </select>
          </Field>

          <Field label="Effective start date" htmlFor="effectiveStart">
            <input
              type="date"
              id="effectiveStart"
              name="effectiveStart"
              className={fieldInput}
              defaultValue={toDateInput(initial?.meta?.effectiveStart)}
              onClick={(e) => e.target.showPicker?.()}
              required
            />
          </Field>

          {billingFrequency === 'Monthly' ? (
            <Field label="Effective end date" htmlFor="effectiveEnd">
              <input
                type="date"
                id="effectiveEnd"
                name="effectiveEnd"
                className={fieldInput}
                defaultValue={toDateInput(initial?.meta?.effectiveEnd)}
                onClick={(e) => e.target.showPicker?.()}
                required
              />
            </Field>
          ) : (
            <p className={fieldHint}>End date is automatically set to 12 months after the start date.</p>
          )}
        </>
      )}

      {!isInsurance && !isSuppliesBulk && expenseCategoryConfig?.extraFields?.map((field) => {
        const fieldDefault = initial?.meta?.[field.name] ?? field.defaultValue

        if (field.type === 'checkbox') {
          return (
            <label className={checkboxLabel} key={field.name}>
              <input type="checkbox" name={field.name} value="true" defaultChecked={fieldDefault === 'true'} />
              {field.label}
            </label>
          )
        }

        return (
          <Field label={field.label} htmlFor={field.name} key={field.name}>
            {field.type === 'select' ? (
              <select id={field.name} name={field.name} className={fieldInput} defaultValue={fieldDefault}>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                id={field.name}
                name={field.name}
                className={fieldInput}
                ref={(el) => { extraFieldRefs.current[field.name] = el }}
                placeholder={field.placeholder}
                defaultValue={fieldDefault}
                required={field.required}
                {...(field.type === 'number' ? { min: 0, max: 100, step: 1 } : {})}
              />
            )}
          </Field>
        )
      })}

      <Field label="Description" htmlFor="description">
        <input type="text" id="description" name="description" className={fieldInput} ref={descriptionRef} defaultValue={initial?.description || ''} />
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" className={submitBtn}>{isEdit ? 'Save changes' : 'Add expense'}</button>
        {isEdit && (
          <button type="button" className={cancelBtn} onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
