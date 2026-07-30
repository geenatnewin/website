import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function getGigs() {
  return sql`SELECT * FROM gigs ORDER BY gig_date DESC, id DESC`
}

export async function getExpenses() {
  return sql`SELECT * FROM expenses ORDER BY expense_date DESC, id DESC`
}

export async function getRecentGigsForDropdown() {
  return sql`SELECT id, gig_date, client FROM gigs ORDER BY gig_date DESC, id DESC LIMIT 50`
}

export async function insertGig({
  gigDate,
  client,
  gigType,
  grossPayment,
  paymentMethod,
  datePaid,
  status,
  mileage,
  notes,
}) {
  await sql`
    INSERT INTO gigs (gig_date, client, gig_type, gross_payment, payment_method, date_paid, status, mileage, notes)
    VALUES (${gigDate}, ${client}, ${gigType}, ${grossPayment}, ${paymentMethod || null}, ${datePaid || null}, ${status}, ${mileage || 0}, ${notes || null})
  `
}

export async function insertExpense({ gigId, expenseDate, category, description, amount, vendor }) {
  await sql`
    INSERT INTO expenses (gig_id, expense_date, category, description, amount, vendor)
    VALUES (${gigId || null}, ${expenseDate}, ${category}, ${description || null}, ${amount}, ${vendor || null})
  `
}
