import { mileageDeduction } from './mileage'
import { deductibleAmount } from './categories'

function quarterlyDeadlinesForYear(year) {
  return [
    { label: `Q1 ${year}`, due: new Date(`${year}-04-15T00:00:00`) },
    { label: `Q2 ${year}`, due: new Date(`${year}-06-15T00:00:00`) },
    { label: `Q3 ${year}`, due: new Date(`${year}-09-15T00:00:00`) },
    { label: `Q4 ${year}`, due: new Date(`${year + 1}-01-15T00:00:00`) },
  ]
}

export function nextQuarterlyDeadline(today = new Date()) {
  const year = today.getFullYear()
  const deadlines = [...quarterlyDeadlinesForYear(year), ...quarterlyDeadlinesForYear(year + 1)]
  return deadlines.find((d) => d.due >= today)
}

export function daysUntil(date, today = new Date()) {
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24))
}

// Year-to-date net profit — the base a quarterly estimated-tax "set aside" figure is built on.
// A flat rate is deliberately used instead of computing real SE-tax/income-tax brackets — those
// depend on filing status, other income, and deductions this app doesn't know. 27% is the
// midpoint of the common 25-30% self-employed rule of thumb; the caller can override it.
export function ytdNetProfit(gigs, expenses, today = new Date()) {
  const yearStart = new Date(today.getFullYear(), 0, 1)

  const ytdGigs = gigs.filter((g) => {
    const d = new Date(g.gig_date)
    return d >= yearStart && d <= today
  })
  const ytdExpenseRows = expenses.filter((e) => {
    const d = new Date(e.expense_date)
    return d >= yearStart && d <= today
  })

  const ytdIncome = ytdGigs.reduce((s, g) => s + Number(g.gross_payment), 0)
  const ytdMileageDeduction = ytdGigs.reduce((s, g) => s + mileageDeduction(g.gig_date, g.mileage), 0)
  const ytdExpenseDeductions = ytdExpenseRows.reduce((s, e) => s + deductibleAmount(e.category, e.amount, e.meta), 0)
  const ytdExpenses = ytdExpenseDeductions + ytdMileageDeduction

  return { ytdIncome, ytdExpenses, netProfit: ytdIncome - ytdExpenses }
}

// Contractors you've PAID $600+ to (you may owe them a 1099-NEC) — distinct from the
// client-side $600+ tracker on the report page, which is about 1099s YOU might receive.
export function contractorsOwed1099(expenses) {
  const byVendor = {}
  for (const e of expenses) {
    if (e.category !== 'contract_labor' || !e.vendor) continue
    byVendor[e.vendor] = (byVendor[e.vendor] || 0) + Number(e.amount)
  }
  return Object.entries(byVendor)
    .filter(([, total]) => total >= 600)
    .sort((a, b) => b[1] - a[1])
}

// Vendors ever flagged "recurring monthly" that have gone 2+ months with nothing logged —
// checking both the current and prior month avoids a false alarm early in the month before
// this cycle's charge would normally show up.
export function missingRecurringExpenses(expenses, today = new Date()) {
  const recurringVendors = new Set()
  for (const e of expenses) {
    if (e.recurring_monthly && e.vendor) recurringVendors.add(e.vendor)
  }

  const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`
  const currentMonthKey = monthKey(today)
  const lastMonthKey = monthKey(new Date(today.getFullYear(), today.getMonth() - 1, 1))

  const loggedMonthsByVendor = {}
  for (const e of expenses) {
    if (!e.vendor || !recurringVendors.has(e.vendor)) continue
    const key = monthKey(new Date(e.expense_date))
    ;(loggedMonthsByVendor[e.vendor] ??= new Set()).add(key)
  }

  return [...recurringVendors]
    .filter((vendor) => {
      const logged = loggedMonthsByVendor[vendor] || new Set()
      return !logged.has(currentMonthKey) && !logged.has(lastMonthKey)
    })
    .sort()
}

export function stalePendingGigs(gigs, staleDays = 14, today = new Date()) {
  return gigs.filter((g) => {
    if (g.status !== 'pending') return false
    const ageDays = (today - new Date(g.gig_date)) / (1000 * 60 * 60 * 24)
    return ageDays >= staleDays
  })
}

export const GENERAL_TAX_TIPS = [
  {
    title: 'Set aside for taxes as you go',
    body: 'A common rule of thumb for self-employed freelancers is to set aside roughly 25–30% of net profit for federal + state + self-employment tax (~15.3% SE tax alone). Ask your preparer for a number tailored to your situation.',
  },
  {
    title: 'Pay quarterly estimated taxes',
    body: 'If you expect to owe $1,000+ for the year, the IRS expects estimated payments each quarter (Apr 15, Jun 15, Sep 15, Jan 15) — missing them can trigger an underpayment penalty even if you pay in full by April.',
  },
  {
    title: 'Home office deduction',
    body: 'If you have a space used regularly and exclusively for editing, business calls, or gear storage, you may be able to deduct a portion of rent/utilities via the home office deduction — ask your preparer whether the simplified or regular method fits better.',
  },
  {
    title: 'Track mileage contemporaneously',
    body: 'Log mileage close to when the trip happens rather than reconstructing it later — this app timestamps entries automatically as you add them.',
  },
  {
    title: 'Meals are only 50% deductible',
    body: 'And the IRS wants the business purpose documented — this app requires that field whenever you log a meal expense, and only counts 50% toward your deduction automatically.',
  },
  {
    title: '1099-NEC for contractors you pay',
    body: 'If you pay any single contractor or assistant $600+ total in a year, you’re generally required to send them a 1099-NEC by Jan 31. This page flags contractors once they cross that threshold.',
  },
  {
    title: 'Retirement contributions lower taxable income',
    body: 'A SEP-IRA or Solo 401(k) can meaningfully reduce your taxable net profit — worth asking your preparer about before year-end.',
  },
  {
    title: 'Self-employed health insurance',
    body: 'If you pay for your own health insurance and aren’t eligible for a spouse’s employer plan, those premiums may be deductible even beyond Schedule C.',
  },
  {
    title: 'Keep records for at least 3 years',
    body: 'The IRS can generally audit up to 3 years back (longer in some cases) — keep receipts, invoices, and the CSV export from this ledger on file.',
  },
  {
    title: 'Big equipment purchases may qualify for Section 179',
    body: 'Cameras, lighting rigs, DJ gear — sometimes deductible in full the year you buy them instead of depreciated over several years. Ask your preparer if Section 179 applies to a purchase.',
  },
]
