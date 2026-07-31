import LogoutMenu from './LogoutMenu'

function NavLink({ href, label, isActive }) {
  return (
    <a
      href={href}
      className={
        isActive
          ? 'block rounded-lg px-3 py-2 text-sm font-semibold text-white bg-brand/20 ring-1 ring-inset ring-brand/40 shadow-[0_0_16px_-4px_rgba(34,209,126,0.55)]'
          : 'block rounded-lg px-3 py-2 text-sm font-medium text-white/55 hover:text-white hover:bg-white/[0.06] transition-colors'
      }
    >
      {label}
    </a>
  )
}

export default function LedgerShell({ active, logout, children }) {
  return (
    <div className="ldg-page-bg min-h-full bg-ink-950 p-0 md:p-6">
      <div className="ldg-shell mx-auto flex max-w-[1280px] flex-col items-stretch overflow-hidden md:flex-row md:rounded-[28px] md:border md:border-white/[0.06] md:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <aside className="ldg-sidebar flex w-full flex-row flex-wrap items-center gap-3 bg-ink-950 px-5 py-4 md:w-[240px] md:flex-shrink-0 md:flex-col md:items-stretch md:gap-8 md:self-stretch md:py-8">
          <a href="/" className="text-sm font-semibold text-white/45 hover:text-white transition-colors">
            &larr; Portfolio
          </a>

          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-stretch">
            <p className="hidden md:block mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-white/25">Menu</p>
            <NavLink href="/dashboard" label="Dashboard" isActive={active === 'dashboard'} />
            <NavLink href="/dashboard/report" label="Overview" isActive={active === 'report'} />
            <NavLink href="/dashboard/tips" label="Tips" isActive={active === 'tips'} />
            <NavLink href="/dashboard/security" label="Security" isActive={active === 'security'} />
          </div>

          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-stretch">
            <p className="hidden md:block mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-white/25">Actions</p>
            <a
              href="/api/ledger/export"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-white/55 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Export CSV
            </a>
          </div>

          <LogoutMenu logout={logout} />
        </aside>

        <main className="min-w-0 flex-1 bg-ink-900 px-5 py-6 md:px-9 md:py-8">{children}</main>
      </div>
    </div>
  )
}
