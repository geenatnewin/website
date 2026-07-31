// Shared card/row primitives for report/page.js and the tips calculators.
// .ldg-print-row/.ldg-print-card are print-only marker classes (no screen
// rule targets them, see ledger.css's @media print) so printed pages still
// get their simplified light-mode treatment even though screen styling here
// is Tailwind.

export function ReportRow({ children, className = '' }) {
  return (
    <div className={`ldg-print-row flex items-center justify-between gap-4 border-b border-white/[0.06] py-2.5 text-sm last:border-none ${className}`}>
      {children}
    </div>
  )
}

// No margin baked in — callers control spacing (grid gap vs. stacked mb-6)
// since this renders both inside report/page.js's chart grid and standalone.
export function ReportCard({ title, children }) {
  return (
    <div className="ldg-print-card rounded-2xl border border-white/[0.06] bg-ink-900 p-5 md:p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">{title}</p>
      {children}
    </div>
  )
}
