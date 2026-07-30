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
export const EXPENSE_CATEGORIES = [
  { value: 'advertising', label: 'Advertising & marketing', scheduleC: 'Line 8', chartColor: 'orange' },
  { value: 'contract_labor', label: 'Contract labor / assistants', scheduleC: 'Line 11', chartColor: 'yellow' },
  { value: 'insurance', label: 'Insurance', scheduleC: 'Line 15', chartColor: 'green' },
  { value: 'legal_professional', label: 'Legal & professional services', scheduleC: 'Line 17', chartColor: 'muted' },
  { value: 'office', label: 'Office expense', scheduleC: 'Line 18', chartColor: 'magenta' },
  { value: 'supplies', label: 'Supplies & equipment', scheduleC: 'Line 22', chartColor: 'aqua' },
  { value: 'travel', label: 'Travel', scheduleC: 'Line 24a', chartColor: 'violet' },
  { value: 'meals', label: 'Meals (50% deductible)', scheduleC: 'Line 24b', chartColor: 'red' },
  { value: 'utilities', label: 'Utilities', scheduleC: 'Line 25', chartColor: 'muted' },
  { value: 'other', label: 'Other expenses', scheduleC: 'Line 27a', chartColor: 'muted' },
]

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
