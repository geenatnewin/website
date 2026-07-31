export const dynamic = 'force-dynamic'

import { logout } from '../actions'
import { getLockoutLog } from '../security'
import LedgerShell from '../LedgerShell'
import { ReportRow, ReportCard } from '../ReportUI'

export const metadata = { title: 'Dashboard — Security' }

export default async function SecurityPage() {
  const lockouts = await getLockoutLog()

  return (
    <LedgerShell active="security" logout={logout}>
      <h1 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-white md:text-left">Security</h1>

      <ReportCard title="Lockout events">
        <p className="mb-4 text-xs text-white/40">
          After 3 wrong password attempts, that IP is blocked for 10 minutes. Only the lockout
          itself is logged here — not each individual wrong guess.
        </p>
        {lockouts.length === 0 && <p className="text-sm text-white/40">No lockouts yet.</p>}
        {lockouts.map((l) => (
          <ReportRow key={l.id}>
            <span>{new Date(l.locked_at).toLocaleString()}</span>
            <span>IP {l.ip}</span>
            <span className="text-xs text-white/40">locked until {new Date(l.locked_until).toLocaleTimeString()}</span>
          </ReportRow>
        ))}
      </ReportCard>
    </LedgerShell>
  )
}
