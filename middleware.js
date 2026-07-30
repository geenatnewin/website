import { NextResponse } from 'next/server'
import { computeSessionToken, LEDGER_COOKIE } from './app/ledger/token'

export const config = {
  matcher: ['/ledger/:path*', '/api/ledger/:path*'],
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/ledger/login') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(LEDGER_COOKIE)?.value
  const expected = await computeSessionToken()

  if (cookie === expected) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/ledger/login', request.url)
  return NextResponse.redirect(loginUrl)
}
