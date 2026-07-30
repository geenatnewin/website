export const dynamic = 'force-dynamic'

import { getGigs, getExpenses } from '../db'
import { logout } from '../actions'
import { GENERAL_TAX_TIPS, ytdNetProfit } from '../taxTips'
import LedgerShell from '../LedgerShell'
import RemindersBanner from '../RemindersBanner'
import EstimatedTaxCard from './EstimatedTaxCard'
import HomeOfficeCard from './HomeOfficeCard'

export const metadata = { title: 'Ledger — Tips' }

export default async function TipsPage() {
  const [gigs, expenses] = await Promise.all([getGigs(), getExpenses()])
  const { ytdIncome, ytdExpenses, netProfit } = ytdNetProfit(gigs, expenses)

  return (
    <LedgerShell active="tips" logout={logout}>
      <h1 className="ldg-page-title">Tips</h1>

      <RemindersBanner gigs={gigs} expenses={expenses} />

      <EstimatedTaxCard ytdIncome={ytdIncome} ytdExpenses={ytdExpenses} netProfit={netProfit} />

      <HomeOfficeCard />

      <section className="ldg-card">
        <p className="ldg-card-title">General tax tips</p>
        <p className="ldg-hint" style={{ marginBottom: '1.25rem' }}>
          General educational info, not professional tax advice — confirm specifics with a licensed
          tax preparer for your situation.
        </p>
        {GENERAL_TAX_TIPS.map((tip) => (
          <div className="ldg-tip" key={tip.title}>
            <p className="ldg-tip-title">{tip.title}</p>
            <p className="ldg-tip-body">{tip.body}</p>
          </div>
        ))}
      </section>
    </LedgerShell>
  )
}
