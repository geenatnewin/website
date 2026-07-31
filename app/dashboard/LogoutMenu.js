'use client'

import { useEffect, useRef, useState } from 'react'

export default function LogoutMenu({ logout }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={wrapRef} className="relative ml-auto md:ml-0 md:mt-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        aria-expanded={open}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          open
            ? 'border-white/20 bg-white/10 text-white'
            : 'border-white/10 bg-ink-800 text-white/50 hover:text-white hover:border-white/20'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>

      {/* Mobile: sidebar is a horizontal bar at the top, pop the button down
          into the room below. Desktop: sidebar is a tall column and this
          icon sits at the bottom (mt-auto) — pop up instead, since .ldg-shell
          clips overflow and there's no room below the icon there. */}
      {open && (
        <form action={logout} className="absolute right-0 top-full z-10 mt-2 md:top-auto md:bottom-full md:mb-2 md:mt-0">
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/25 transition-colors"
          >
            Log out
          </button>
        </form>
      )}
    </div>
  )
}
