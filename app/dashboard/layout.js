import './ledger.css'

export const metadata = {
  title: 'Dashboard',
  description: 'Gig income & expense tracker',
}

export default function LedgerLayout({ children }) {
  return <div className="ldg-root">{children}</div>
}
