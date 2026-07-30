'use client'

import { useState } from 'react'

export default function MonthSection({ label, count, totalLabel, defaultOpen, children }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))

  return (
    <div className="ldg-month-group">
      <button
        type="button"
        className="ldg-month-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`ldg-row-chevron ${open ? 'ldg-row-chevron-open' : ''}`} aria-hidden="true">▸</span>
        <span className="ldg-month-label">{label}</span>
        <span className="ldg-month-meta">
          {count} {count === 1 ? 'entry' : 'entries'}
          {totalLabel ? ` · ${totalLabel}` : ''}
        </span>
      </button>
      {open && <div className="ldg-month-body">{children}</div>}
    </div>
  )
}
