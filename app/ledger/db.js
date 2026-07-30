import { neon } from '@neondatabase/serverless'

// Next.js patches the global fetch() and, by default, caches responses — including
// the HTTP calls this driver makes to Neon's data API. Without this, page reloads can
// serve a stale snapshot instead of the current database state. Force every query fresh.
const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: 'no-store' } })

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
  gigTypeOther,
  grossPayment,
  paymentMethod,
  datePaid,
  status,
  mileage,
  notes,
}) {
  await sql`
    INSERT INTO gigs (gig_date, client, gig_type, gig_type_other, gross_payment, payment_method, date_paid, status, mileage, notes)
    VALUES (${gigDate}, ${client}, ${gigType}, ${gigType === 'other' ? gigTypeOther || null : null}, ${grossPayment}, ${paymentMethod || null}, ${datePaid || null}, ${status}, ${mileage || 0}, ${notes || null})
  `
}

export async function updateGig(id, {
  gigDate,
  client,
  gigType,
  gigTypeOther,
  grossPayment,
  paymentMethod,
  datePaid,
  status,
  mileage,
  notes,
}) {
  await sql`
    UPDATE gigs SET
      gig_date = ${gigDate},
      client = ${client},
      gig_type = ${gigType},
      gig_type_other = ${gigType === 'other' ? gigTypeOther || null : null},
      gross_payment = ${grossPayment},
      payment_method = ${paymentMethod || null},
      date_paid = ${datePaid || null},
      status = ${status},
      mileage = ${mileage || 0},
      notes = ${notes || null}
    WHERE id = ${id}
  `
}

export async function deleteGig(id) {
  await sql`DELETE FROM gigs WHERE id = ${id}`
}

export async function insertExpense({ gigId, expenseDate, category, description, amount, vendor, meta }) {
  await sql`
    INSERT INTO expenses (gig_id, expense_date, category, description, amount, vendor, meta)
    VALUES (${gigId || null}, ${expenseDate}, ${category}, ${description || null}, ${amount}, ${vendor || null}, ${JSON.stringify(meta || {})}::jsonb)
  `
}

export async function updateExpense(id, { gigId, expenseDate, category, description, amount, vendor, meta }) {
  await sql`
    UPDATE expenses SET
      gig_id = ${gigId || null},
      expense_date = ${expenseDate},
      category = ${category},
      description = ${description || null},
      amount = ${amount},
      vendor = ${vendor || null},
      meta = ${JSON.stringify(meta || {})}::jsonb
    WHERE id = ${id}
  `
}

export async function deleteExpense(id) {
  await sql`DELETE FROM expenses WHERE id = ${id}`
}
