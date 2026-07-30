// One-time setup script: creates the gigs/expenses tables in the connected Neon database.
// Run with: node scripts/init-ledger-db.mjs
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
  if (!match) continue
  let value = match[2]
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
  process.env[match[1]] ??= value
}

const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS gigs (
    id SERIAL PRIMARY KEY,
    gig_date DATE NOT NULL,
    client TEXT NOT NULL,
    gig_type TEXT NOT NULL DEFAULT 'other',
    gross_payment NUMERIC(10,2) NOT NULL,
    payment_method TEXT,
    date_paid DATE,
    status TEXT NOT NULL DEFAULT 'paid',
    mileage NUMERIC(6,1) NOT NULL DEFAULT 0,
    notes TEXT,
    gig_type_other TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    gig_id INTEGER REFERENCES gigs(id) ON DELETE SET NULL,
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    vendor TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    receipt_url TEXT,
    recurring_monthly BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`

// Idempotent — covers databases created before these columns existed.
await sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT`
await sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring_monthly BOOLEAN NOT NULL DEFAULT false`

await sql`
  CREATE TABLE IF NOT EXISTS login_security (
    ip TEXT PRIMARY KEY,
    failed_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS login_lockout_log (
    id SERIAL PRIMARY KEY,
    ip TEXT NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_until TIMESTAMPTZ NOT NULL
  )
`

console.log('Ledger tables ready.')
