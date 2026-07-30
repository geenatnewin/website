export const PAYMENT_METHODS = [
  'Venmo',
  'Zelle',
  'Cash App',
  'PayPal',
  'Direct Deposit',
  'Check',
  'Cash',
]

export const GIG_TYPES = [
  { value: 'photography', label: 'Photography' },
  { value: 'videography', label: 'Videography' },
  { value: 'dj', label: 'DJ' },
  { value: 'other', label: 'Other' },
]

// Maps 1:1 to Schedule C Part II expense lines.
// chartColor is a fixed per-category identity (never reassigned by rank) drawn from
// the validated dark-mode categorical palette — see ledger.css --chart-* tokens.
//
// vendorLabel: contextual label for the shared "vendor" field.
// extraField: an optional category-specific field, stored in expenses.meta (JSONB).
// deductibleFraction(meta): fraction of the raw amount that's actually tax-deductible
// (meals are 50% per IRS rule; utilities depend on the declared business-use %).
export const EXPENSE_CATEGORIES = [
  {
    value: 'advertising', label: 'Advertising & marketing', scheduleC: 'Line 8', chartColor: 'orange',
    vendorLabel: 'Platform / vendor',
  },
  {
    value: 'contract_labor', label: 'Contract labor / assistants', scheduleC: 'Line 11', chartColor: 'yellow',
    vendorLabel: 'Contractor name',
    hint: 'If you pay this person $600+ total this year, you may need to issue them a 1099-NEC.',
  },
  {
    value: 'insurance', label: 'Insurance', scheduleC: 'Line 15', chartColor: 'green',
    vendorLabel: 'Insurance provider',
    extraField: { name: 'policyType', label: 'Policy type', placeholder: 'Liability, equipment, health…' },
  },
  {
    value: 'legal_professional', label: 'Legal & professional services', scheduleC: 'Line 17', chartColor: 'muted',
    vendorLabel: 'Firm / professional',
    extraField: { name: 'serviceType', label: 'Service type', placeholder: 'Accounting, legal…' },
  },
  {
    value: 'office', label: 'Office expense', scheduleC: 'Line 18', chartColor: 'magenta',
    vendorLabel: 'Vendor',
  },
  {
    value: 'supplies', label: 'Supplies & equipment', scheduleC: 'Line 22', chartColor: 'aqua',
    vendorLabel: 'Vendor',
    extraField: { name: 'item', label: 'Item / equipment', placeholder: 'e.g. memory card, lens, tripod' },
  },
  {
    value: 'travel', label: 'Travel', scheduleC: 'Line 24a', chartColor: 'violet',
    vendorLabel: 'Vendor',
    extraField: { name: 'destination', label: 'Destination / purpose', placeholder: 'e.g. flight to NYC for a shoot' },
  },
  {
    value: 'meals', label: 'Meals (50% deductible)', scheduleC: 'Line 24b', chartColor: 'red',
    vendorLabel: 'Restaurant',
    extraField: { name: 'businessPurpose', label: 'Business purpose (who / why)', placeholder: 'Required by the IRS for meal deductions', required: true },
    hint: 'Only 50% of this amount counts as deductible — calculated automatically in the report.',
    deductibleFraction: () => 0.5,
  },
  {
    value: 'utilities', label: 'Utilities', scheduleC: 'Line 25', chartColor: 'muted',
    vendorLabel: 'Provider',
    extraField: { name: 'businessUsePercent', label: '% used for business', type: 'number', placeholder: '100', defaultValue: '100' },
    hint: 'Only the business-use % counts as deductible — e.g. a phone used 60% for work is 60% deductible.',
    deductibleFraction: (meta) => {
      const pct = Number(meta?.businessUsePercent)
      return Number.isFinite(pct) && pct >= 0 ? Math.min(pct, 100) / 100 : 1
    },
  },
  {
    value: 'other', label: 'Other expenses', scheduleC: 'Line 27a', chartColor: 'muted',
    vendorLabel: 'Vendor',
  },
]

export function categoryConfig(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)
}

export function deductibleAmount(category, amount, meta) {
  const config = categoryConfig(category)
  const fraction = config?.deductibleFraction ? config.deductibleFraction(meta) : 1
  return Number(amount) * fraction
}

export function metaSummary(category, meta) {
  const config = categoryConfig(category)
  if (!config?.extraField || !meta) return ''
  const value = meta[config.extraField.name]
  if (!value) return ''
  const suffix = config.extraField.type === 'number' ? '%' : ''
  return `${config.extraField.label}: ${value}${suffix}`
}

// Synthetic segment for the mileage-derived car & truck deduction (Line 9) — not a stored category.
export const MILEAGE_CHART_COLOR = 'blue'

export function categoryChartColor(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.chartColor || 'muted'
}

export function categoryLabel(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value
}

export function categoryScheduleCLine(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.scheduleC || 'Line 27a'
}
