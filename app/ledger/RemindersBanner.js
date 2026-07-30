import { nextQuarterlyDeadline, daysUntil, contractorsOwed1099, stalePendingGigs } from './taxTips'

export default function RemindersBanner({ gigs, expenses }) {
  const deadline = nextQuarterlyDeadline()
  const days = daysUntil(deadline.due)
  const contractors = contractorsOwed1099(expenses)
  const pending = stalePendingGigs(gigs)

  return (
    <section className="ldg-card ldg-reminders">
      <p className="ldg-card-title">Reminders</p>

      <div className="ldg-reminder-row">
        <span className="ldg-reminder-icon">📅</span>
        <span>
          Next estimated tax deadline: <strong>{deadline.label}</strong> ({deadline.due.toLocaleDateString()}) —{' '}
          {days} day{days === 1 ? '' : 's'} away.
        </span>
      </div>

      {contractors.length > 0 && (
        <div className="ldg-reminder-row ldg-reminder-warning">
          <span className="ldg-reminder-icon">⚠️</span>
          <span>
            You've paid{' '}
            {contractors.map(([name, total], i) => (
              <span key={name}>
                {i > 0 && ', '}
                <strong>{name}</strong> ${total.toFixed(2)}
              </span>
            ))}{' '}
            this year — over the $600 threshold, so you may need to send{' '}
            {contractors.length === 1 ? 'them' : 'each of them'} a 1099-NEC by Jan 31.
          </span>
        </div>
      )}

      {pending.length > 0 && (
        <div className="ldg-reminder-row ldg-reminder-warning">
          <span className="ldg-reminder-icon">⏳</span>
          <span>
            {pending.length} gig{pending.length === 1 ? ' is' : 's are'} still marked <strong>pending</strong> from
            2+ weeks ago — worth checking if payment came through.
          </span>
        </div>
      )}

      <a href="/ledger/tips" className="ldg-reminder-link">See all tax tips →</a>
    </section>
  )
}
