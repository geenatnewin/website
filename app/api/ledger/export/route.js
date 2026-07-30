import { getGigs, getExpenses } from '../../../dashboard/db'
import { categoryLabel, deductibleAmount, metaSummary } from '../../../dashboard/categories'
import { mileageDeduction } from '../../../dashboard/mileage'

export const dynamic = 'force-dynamic'

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function isoDate(dateInput) {
  return new Date(dateInput).toISOString().slice(0, 10)
}

export async function GET() {
  const [gigs, expenses] = await Promise.all([getGigs(), getExpenses()])

  const rows = [
    ['Type', 'Date', 'Client/Vendor', 'Category/GigType', 'Amount', 'DeductibleAmount', 'MileageDeduction', 'PaymentMethod/Status', 'Details', 'Notes'].join(','),
  ]

  for (const g of gigs) {
    rows.push(
      [
        'Gig income',
        isoDate(g.gig_date),
        csvEscape(g.client),
        g.gig_type === 'other' && g.gig_type_other ? g.gig_type_other : g.gig_type,
        Number(g.gross_payment).toFixed(2),
        '',
        mileageDeduction(g.gig_date, g.mileage).toFixed(2),
        csvEscape(`${g.payment_method || ''} / ${g.status}`),
        '',
        csvEscape(g.notes || ''),
      ].join(',')
    )
  }

  for (const e of expenses) {
    rows.push(
      [
        'Expense',
        isoDate(e.expense_date),
        csvEscape(e.vendor || ''),
        categoryLabel(e.category),
        Number(e.amount).toFixed(2),
        deductibleAmount(e.category, e.amount, e.meta).toFixed(2),
        '',
        '',
        csvEscape(metaSummary(e.category, e.meta)),
        csvEscape(e.description || ''),
      ].join(',')
    )
  }

  const csv = rows.join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="ledger-export.csv"',
    },
  })
}
