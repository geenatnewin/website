export const dynamic = 'force-dynamic'

import { getGigs, getExpenses } from '../db'
import { logout } from '../actions'
import { GENERAL_TAX_TIPS, ytdNetProfit } from '../taxTips'
import LedgerShell from '../LedgerShell'
import RemindersBanner from '../RemindersBanner'
import EstimatedTaxCard from './EstimatedTaxCard'
import HomeOfficeCard from './HomeOfficeCard'
import { ReportCard } from '../ReportUI'

export const metadata = { title: 'Dashboard — Tips' }

export default async function TipsPage() {
  const [gigs, expenses] = await Promise.all([getGigs(), getExpenses()])
  const { ytdIncome, ytdExpenses, netProfit } = ytdNetProfit(gigs, expenses)

  return (
    <LedgerShell active="tips" logout={logout}>
      <h1 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-white md:text-left">Tips</h1>

      <RemindersBanner gigs={gigs} expenses={expenses} />

      <div className="mb-6">
        <EstimatedTaxCard ytdIncome={ytdIncome} ytdExpenses={ytdExpenses} netProfit={netProfit} />
      </div>

      <div className="mb-6">
        <HomeOfficeCard />
      </div>

      <ReportCard title="General tax tips">
        <p className="mb-5 text-xs text-white/40">
          General educational info, not professional tax advice — confirm specifics with a licensed
          tax preparer for your situation.
        </p>
        {GENERAL_TAX_TIPS.map((tip) => (
          <div className="border-b border-white/[0.06] py-4 last:border-none first:pt-0" key={tip.title}>
            <p className="mb-1.5 text-sm font-bold text-white">{tip.title}</p>
            <p className="text-sm leading-relaxed text-white/55">{tip.body}</p>
          </div>
        ))}
      </ReportCard>
    </LedgerShell>
  )
}
