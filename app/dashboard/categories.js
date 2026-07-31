export const PAYMENT_METHODS = [
  'Venmo',
  'Zelle',
  'Cash App',
  'PayPal',
  'Direct Deposit',
  'Check',
  'Cash',
]

// chartColor is used by the report page's gig-type donut chart (GigEntry.js's
// own badge/border no longer varies by type — see GigEntry.js).
export const GIG_TYPES = [
  { value: 'photography', label: 'Photography', chartColor: 'blue' },
  { value: 'videography', label: 'Videography', chartColor: 'violet' },
  { value: 'dj', label: 'DJ', chartColor: 'orange' },
  { value: 'other', label: 'Other', chartColor: 'muted' },
]

// Maps 1:1 to Schedule C Part II expense lines.
// chartColor is a fixed per-category identity (never reassigned by rank) drawn from
// the validated dark-mode categorical palette — see ledger.css --chart-* tokens.
//
// vendorLabel: contextual label for the shared "vendor" field.
// extraFields: optional category-specific fields, stored in expenses.meta (JSONB).
//   Each field: { name, label, type ('text'|'number'|'date'|'select'), placeholder, defaultValue, required, unit, options }
// deductibleFraction(meta): fraction of the raw amount that's actually tax-deductible
// (meals are 50% per IRS rule; utilities depend on the declared business-use %).
export const EXPENSE_CATEGORIES = [
  {
    value: 'advertising', label: 'Advertising & marketing', scheduleC: 'Line 8', chartColor: 'orange',
    vendorLabel: 'Platform / vendor',
    hint: 'Ordinary promotion (ad spend, boosted posts, business cards, website upkeep) is fully deductible when paid. A one-time full website build or brand redesign is often a capital expense instead — amortized over time rather than expensed all at once. A gift to a client belongs in Other, not here, and is capped at $25/person/year.',
  },
  {
    value: 'contract_labor', label: 'Contract labor / assistants', scheduleC: 'Line 11', chartColor: 'yellow',
    vendorLabel: 'Contractor name',
    hint: 'If you pay this person $600+ total this year, you may need to issue them a 1099-NEC.',
  },
  {
    value: 'insurance', label: 'Insurance', scheduleC: 'Line 15', chartColor: 'green',
    vendorLabel: 'Insurance provider',
    extraFields: [
      { name: 'policyType', label: 'Policy type', placeholder: 'Liability, equipment, health…' },
      { name: 'billingFrequency', label: 'Billing frequency', type: 'select', options: ['Monthly', 'Annual'], defaultValue: 'Monthly' },
      { name: 'effectiveStart', label: 'Effective start date', type: 'date' },
      { name: 'effectiveEnd', label: 'Effective end date', type: 'date' },
    ],
    hint: 'Business insurance (liability, equipment/gear, E&O) is fully deductible here. Your own health insurance premiums are NOT a Schedule C expense — those go on Schedule 1 as the self-employed health insurance deduction instead, so don\'t log them here too.',
  },
  {
    value: 'legal_professional', label: 'Legal & professional services', scheduleC: 'Line 17', chartColor: 'muted',
    vendorLabel: 'Firm / professional',
    extraFields: [{ name: 'serviceType', label: 'Service type', placeholder: 'Accounting, legal…' }],
    hint: 'Deductible when it\'s ordinary business use — bookkeeping, accounting, contract review, business-related legal advice. Fees tied to acquiring a capital asset (e.g. buying property) get capitalized instead of expensed, and personal legal matters don\'t count here even if it\'s the same lawyer/firm.',
  },
  {
    value: 'office', label: 'Office expense', scheduleC: 'Line 18', chartColor: 'magenta',
    vendorLabel: 'Vendor',
    hint: 'Day-to-day office costs (software subscriptions, small supplies, postage) are fully deductible when paid. If you have a dedicated home office, its share of rent/utilities/mortgage interest is a separate home-office deduction (Form 8829) — don\'t just log it here.',
  },
  {
    value: 'supplies', label: 'Supplies & equipment', scheduleC: 'Line 22', chartColor: 'aqua',
    vendorLabel: 'Brand/Vendor',
    extraFields: [
      { name: 'item', label: 'Item / equipment', placeholder: 'e.g. memory card, lens, tripod' },
      { name: 'capitalAsset', label: 'Capital asset', type: 'checkbox' },
    ],
    hint: 'Small consumables (cards, batteries, cables) are fully deductible when bought. Bigger gear (camera bodies, lenses, computers) over ~$2,500 is usually a capital asset that has to be depreciated over several years instead — unless your accountant elects Section 179 to write it off all at once. Flag purchases over $2,500 as a capital asset below so they stand out for your tax preparer instead of blending into ordinary supplies.',
  },
  {
    value: 'travel', label: 'Travel', scheduleC: 'Line 24a', chartColor: 'violet',
    vendorLabel: 'Vendor',
    extraFields: [{ name: 'destination', label: 'Destination / purpose', placeholder: 'e.g. flight to NYC for a shoot' }],
    hint: 'Only the night(s) actually tied to the gig (travel day + shoot day) are deductible — extra personal nights on the same trip aren\'t, even on one hotel bill. If it\'s a lump sum, divide by nights and enter just the business portion.',
  },
  {
    value: 'meals', label: 'Meals (50% deductible)', scheduleC: 'Line 24b', chartColor: 'red',
    vendorLabel: 'Restaurant',
    extraFields: [{ name: 'businessPurpose', label: 'Business purpose (who / why)', placeholder: 'e.g. "client dinner w/ X" or "overnight travel for [gig]"', required: true }],
    hint: 'Only 50% is deductible (auto-calculated). Qualifies as either a client meal (business actually discussed) or a travel meal (you\'re away from home overnight for a gig) — a solo meal on a local day gig usually doesn\'t count. On a multi-day trip, only log meals for the gig day(s) + necessary travel days — not extra personal days tacked on.',
    deductibleFraction: () => 0.5,
  },
  {
    value: 'utilities', label: 'Utilities', scheduleC: 'Line 25', chartColor: 'muted',
    vendorLabel: 'Provider',
    extraFields: [{ name: 'businessUsePercent', label: '% used for business', type: 'number', unit: '%', placeholder: '100', defaultValue: '100' }],
    hint: 'Only the business-use % counts as deductible — e.g. a phone used 60% for work is 60% deductible.',
    deductibleFraction: (meta) => {
      const pct = Number(meta?.businessUsePercent)
      return Number.isFinite(pct) && pct >= 0 ? Math.min(pct, 100) / 100 : 1
    },
  },
  {
    value: 'other', label: 'Other expenses', scheduleC: 'Line 27a', chartColor: 'muted',
    vendorLabel: 'Vendor',
    hint: 'Catch-all for anything that doesn\'t fit elsewhere. Two common traps: client/referral gifts are only deductible up to $25 per person per year (the excess isn\'t deductible), and clothing only counts if it\'s not suitable for everyday wear — a branded shirt qualifies, plain black attire usually doesn\'t.',
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
  // Multi-item supply purchases (one cart = one expense) store their items array
  // instead of the single item/capitalAsset fields below — summarize separately.
  if (category === 'supplies' && Array.isArray(meta?.items)) {
    if (meta.items.length === 0) return ''
    if (meta.items.length === 1) {
      const only = meta.items[0]
      if (!only.name) return ''
      return `Item / equipment: ${only.name}${only.capitalAsset ? ' · Capital asset' : ''}`
    }
    return `${meta.items.length} items`
  }

  const config = categoryConfig(category)
  if (!config?.extraFields || !meta) return ''
  const parts = []
  for (const field of config.extraFields) {
    const value = meta[field.name]
    if (!value) continue
    parts.push(field.type === 'checkbox' ? field.label : `${field.label}: ${value}${field.unit || ''}`)
  }
  return parts.join(' · ')
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
