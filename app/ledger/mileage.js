// IRS standard business mileage rate by date range. Add a new entry each time the IRS updates it.
const RATE_TABLE = [
  { from: '2026-01-01', to: '2026-06-30', rate: 0.725 },
  { from: '2026-07-01', to: '2026-12-31', rate: 0.76 },
]

export function mileageRateForDate(dateInput) {
  const d = new Date(dateInput)
  for (const period of RATE_TABLE) {
    if (d >= new Date(period.from) && d <= new Date(period.to + 'T23:59:59')) return period.rate
  }
  return RATE_TABLE[RATE_TABLE.length - 1].rate
}

export function mileageDeduction(dateInput, miles) {
  return Number(miles || 0) * mileageRateForDate(dateInput)
}
