import { NextResponse } from 'next/server'
import { computeSessionToken, LEDGER_COOKIE } from '../../../ledger/token'

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}))

  if (password !== process.env.LEDGER_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

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
