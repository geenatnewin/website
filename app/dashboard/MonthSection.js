'use client'

import { useState } from 'react'

export default function MonthSection({ label, count, totalLabel, defaultOpen, children }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))

  return (
    <div className="mb-2 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.06] bg-ink-800 px-3.5 py-2.5 text-left hover:border-white/[0.14] transition-colors"
      >
        <span
          className={`inline-block flex-none text-[0.6rem] text-white/40 transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          &#9656;
        </span>
        <span className="text-sm font-bold text-white">{label}</span>
        <span className="ml-auto whitespace-nowrap text-xs text-white/40">
          {count} {count === 1 ? 'entry' : 'entries'}
          {totalLabel ? ` · ${totalLabel}` : ''}
        </span>
      </button>
      {open && <div className="pt-2.5">{children}</div>}
    </div>
  )
}
