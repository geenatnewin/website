import { headers } from 'next/headers'
import { login } from '../actions'
import { getClientIP, checkLockout } from '../security'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ledger — Login' }

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
        <p className="ldg-brand">[LEDGER]</p>
        {isLocked ? (
          <p className="ldg-error" style={{ marginTop: '1.5rem' }}>
            Too many failed attempts. Locked out
            {lockout.until ? ` until ${lockout.until.toLocaleTimeString()}.` : ' for 10 minutes.'}
          </p>
        ) : (
          <>
            <LoginForm login={login} />
            {hasError && (
              <p className="ldg-error">
                Wrong username or password.
                {remaining != null && ` ${remaining} attempt${remaining === 1 ? '' : 's'} left before a 10-minute lockout.`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
