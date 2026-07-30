import { headers } from 'next/headers'
import { login } from '../actions'
import { getClientIP, checkLockout } from '../security'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — Login' }

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const hasError = params?.error
  const remaining = params?.remaining ? Number(params.remaining) : null

  const ip = getClientIP(headers())
  const lockout = await checkLockout(ip)
  const isLocked = params?.locked || lockout.locked

  return (
    <div className="ldg-login-wrap">
      <div className="ldg-login-box">
        <p className="ldg-brand">[PRIVATE ACCESS]</p>
        {isLocked ? (
          <p className="ldg-error" style={{ marginTop: '1.5rem' }}>
            Too many failed attempts. Locked out
            {lockout.until ? ` until ${lockout.until.toLocaleTimeString()}.` : ' for 10 minutes.'}
          </p>
        ) : (
          <form action={login} className="ldg-login-form">
            <label className="ldg-label" htmlFor="password">Password</label>
            <input
              className="ldg-input"
              type="password"
              id="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
            />
            <button className="ldg-btn" type="submit">Enter</button>
            {hasError && (
              <p className="ldg-error">
                Wrong password.
                {remaining != null && ` ${remaining} attempt${remaining === 1 ? '' : 's'} left before a 10-minute lockout.`}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
