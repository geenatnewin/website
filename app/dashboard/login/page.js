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
    <div className="flex min-h-full items-center justify-center bg-ink-950 p-8">
      <div className="w-full max-w-[320px] rounded-3xl border border-white/[0.06] bg-ink-900 p-10 text-center shadow-[0_0_60px_rgba(34,209,126,0.14),0_20px_50px_rgba(0,0,0,0.4)]">
        <p className="text-lg font-bold text-white">[PRIVATE ACCESS]</p>
        {isLocked ? (
          <p className="mt-6 text-sm font-semibold text-rose-400">
            Too many failed attempts. Locked out
            {lockout.until ? ` until ${lockout.until.toLocaleTimeString()}.` : ' for 10 minutes.'}
          </p>
        ) : (
          <form action={login} className="mt-6 flex flex-col gap-3 text-left">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/50" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-ink-950 px-3.5 py-3 text-[0.95rem] text-white outline-none focus:border-brand/60 transition-colors"
              type="password"
              id="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
            />
            <button
              className="mt-1 rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_-4px_rgba(34,209,126,0.5)] hover:opacity-90 transition-opacity"
              type="submit"
            >
              Enter
            </button>
            {hasError && (
              <p className="text-sm font-semibold text-rose-400">
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
