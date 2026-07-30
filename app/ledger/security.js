import { neon } from '@neondatabase/serverless'

// See db.js for why this matters — without it, Next.js can cache the fetch() calls
// this driver makes under the hood, serving stale lockout/attempt-count reads.
const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: 'no-store' } })

// 1 failed attempt + 2 more allowed (3 total) before a 10-minute lockout kicks in.
const MAX_FAILED_ATTEMPTS = 3
const LOCKOUT_MINUTES = 10

export function getClientIP(headerSource) {
  const forwarded = headerSource.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headerSource.get('x-real-ip') || 'unknown'
}

export async function checkLockout(ip) {
  const rows = await sql`SELECT locked_until FROM login_security WHERE ip = ${ip}`
  if (!rows.length || !rows[0].locked_until) return { locked: false }
  const lockedUntil = new Date(rows[0].locked_until)
  if (lockedUntil > new Date()) return { locked: true, until: lockedUntil }
  return { locked: false }
}

// Only called on a WRONG password. Returns whether this failure just triggered a lockout.
export async function recordFailedAttempt(ip) {
  const rows = await sql`
    INSERT INTO login_security (ip, failed_count, updated_at)
    VALUES (${ip}, 1, now())
    ON CONFLICT (ip) DO UPDATE SET failed_count = login_security.failed_count + 1, updated_at = now()
    RETURNING failed_count
  `
  const failedCount = rows[0].failed_count

  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
    await sql`UPDATE login_security SET locked_until = ${lockedUntil.toISOString()}, failed_count = 0 WHERE ip = ${ip}`
    await sql`INSERT INTO login_lockout_log (ip, locked_until) VALUES (${ip}, ${lockedUntil.toISOString()})`
    return { lockedOut: true, until: lockedUntil }
  }
  return { lockedOut: false, remaining: MAX_FAILED_ATTEMPTS - failedCount }
}

export async function recordSuccessfulLogin(ip) {
  await sql`UPDATE login_security SET failed_count = 0, locked_until = NULL WHERE ip = ${ip}`
}

export async function getLockoutLog() {
  return sql`SELECT * FROM login_lockout_log ORDER BY locked_at DESC LIMIT 200`
}
