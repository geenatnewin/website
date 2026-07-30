import { NextResponse } from 'next/server'
import { computeSessionToken, LEDGER_COOKIE } from '../../../ledger/token'
import { getClientIP, checkLockout, recordFailedAttempt, recordSuccessfulLogin } from '../../../ledger/security'

export async function POST(request) {
  const ip = getClientIP(request.headers)

  const lockout = await checkLockout(ip)
  if (lockout.locked) {
    return NextResponse.json({ locked: true, until: lockout.until }, { status: 429 })
  }

  const { username, password } = await request.json().catch(() => ({}))

  if (username !== process.env.LEDGER_USERNAME || password !== process.env.LEDGER_PASSWORD) {
    const result = await recordFailedAttempt(ip)
    if (result.lockedOut) {
      return NextResponse.json({ locked: true, until: result.until }, { status: 429 })
    }
    return NextResponse.json({ ok: false, remaining: result.remaining }, { status: 401 })
  }

  await recordSuccessfulLogin(ip)
  const token = await computeSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(LEDGER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
    path: '/',
  })
  return response
}
