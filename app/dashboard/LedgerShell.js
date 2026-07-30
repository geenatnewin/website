export default function LedgerShell({ active, logout, children }) {
  return (
    <div className="ldg-page-bg">
      <div className="ldg-shell">
        <aside className="ldg-sidebar">
          <a href="/" className="ldg-sidebar-brand">← Portfolio</a>

          <div className="ldg-sidebar-group">
            <p className="ldg-sidebar-label">Menu</p>
            <a href="/dashboard" className={`ldg-sidebar-link ${active === 'dashboard' ? 'ldg-sidebar-link-active' : ''}`}>
              Dashboard
            </a>
            <a href="/dashboard/report" className={`ldg-sidebar-link ${active === 'report' ? 'ldg-sidebar-link-active' : ''}`}>
              Overview
            </a>
            <a href="/dashboard/tips" className={`ldg-sidebar-link ${active === 'tips' ? 'ldg-sidebar-link-active' : ''}`}>
              Tips
            </a>
            <a href="/dashboard/security" className={`ldg-sidebar-link ${active === 'security' ? 'ldg-sidebar-link-active' : ''}`}>
              Security
            </a>
          </div>

          <div className="ldg-sidebar-group">
            <p className="ldg-sidebar-label">Actions</p>
            <a href="/api/ledger/export" className="ldg-sidebar-link">Export CSV</a>
          </div>

          <form action={logout} className="ldg-sidebar-logout">
            <button type="submit" className="ldg-sidebar-link ldg-sidebar-link-danger">Log out</button>
          </form>
        </aside>

        <main className="ldg-main">{children}</main>
      </div>
    </div>
  )
}
