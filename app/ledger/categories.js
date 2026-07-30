export const GIG_TYPES = [
  { value: 'photography', label: 'Photography' },
  { value: 'dj', label: 'DJ' },
  { value: 'other', label: 'Other' },
]

// Maps 1:1 to Schedule C Part II expense lines.
export const EXPENSE_CATEGORIES = [
  { value: 'advertising', label: 'Advertising & marketing', scheduleC: 'Line 8' },
  { value: 'contract_labor', label: 'Contract labor / assistants', scheduleC: 'Line 11' },
  { value: 'insurance', label: 'Insurance', scheduleC: 'Line 15' },
  { value: 'legal_professional', label: 'Legal & professional services', scheduleC: 'Line 17' },
  { value: 'office', label: 'Office expense', scheduleC: 'Line 18' },
  { value: 'supplies', label: 'Supplies & equipment', scheduleC: 'Line 22' },
  { value: 'travel', label: 'Travel', scheduleC: 'Line 24a' },
  { value: 'meals', label: 'Meals (50% deductible)', scheduleC: 'Line 24b' },
  { value: 'utilities', label: 'Utilities', scheduleC: 'Line 25' },
  { value: 'other', label: 'Other expenses', scheduleC: 'Line 27a' },
]

export function categoryLabel(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value
}

export function categoryScheduleCLine(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.scheduleC || 'Line 27a'
}
