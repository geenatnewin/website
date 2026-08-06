import { NextResponse } from 'next/server'
import { computeSessionToken, LEDGER_COOKIE } from './app/dashboard/token'

export const config = {
  matcher: ['/dashboard/:path*', '/api/ledger/:path*'],
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Login page/route, plus the tab favicon — a browser requests the favicon before any
  // auth exists (e.g. on the login page itself), so gating it behind login just breaks it.
  if (pathname === '/dashboard/login' || pathname === '/api/ledger/login' || pathname === '/dashboard/icon.png') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(LEDGER_COOKIE)?.value
  const expected = await computeSessionToken()

  if (cookie === expected) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/dashboard/login', request.url)
  return NextResponse.redirect(loginUrl)
}
