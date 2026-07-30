export const dynamic = 'force-dynamic'

import { logout } from '../actions'
import { getLockoutLog } from '../security'
import LedgerShell from '../LedgerShell'

export const metadata = { title: 'Dashboard — Security' }

export default async function SecurityPage() {
  const lockouts = await getLockoutLog()

  return (
    <LedgerShell active="security" logout={logout}>
      <h1 className="ldg-page-title">Security</h1>

      <section className="ldg-card">
        <p className="ldg-card-title">Lockout events</p>
        <p className="ldg-hint" style={{ marginBottom: '1rem' }}>
          After 3 wrong password attempts, that IP is blocked for 10 minutes. Only the lockout
          itself is logged here — not each individual wrong guess.
        </p>
        {lockouts.length === 0 && <p className="ldg-empty">No lockouts yet.</p>}
        {lockouts.map((l) => (
          <div className="ldg-report-row" key={l.id}>
            <span>{new Date(l.locked_at).toLocaleString()}</span>
            <span>IP {l.ip}</span>
            <span className="ldg-report-sub">locked until {new Date(l.locked_until).toLocaleTimeString()}</span>
          </div>
        ))}
      </section>
    </LedgerShell>
  )
}
