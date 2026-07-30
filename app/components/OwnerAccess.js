'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function OwnerAccess() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setError(false)
        setRemaining(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ledger/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = '/ledger'
        return
      }
      const data = await res.json().catch(() => ({}))
      if (res.status === 429 || data.locked) {
        setLocked(true)
      } else {
        setError(true)
        setRemaining(data.remaining ?? null)
      }
      setLoading(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  if (pathname?.startsWith('/ledger')) return null

  return (
    <div className="owner-access" ref={wrapRef}>
      {!open ? (
        <button
          type="button"
          className="owner-access-trigger"
          onClick={() => setOpen(true)}
          aria-label="Owner access"
        >
          owner access
        </button>
      ) : (
        <form className="owner-access-form" onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoFocus
            disabled={locked}
            className="owner-access-input"
          />
          <button type="submit" className="owner-access-go" disabled={loading || locked} aria-label="Enter">→</button>
          {error && (
            <span className="owner-access-error">
              wrong{remaining != null ? ` — ${remaining} left` : ''}
            </span>
          )}
          {locked && <span className="owner-access-error">locked 10 min</span>}
        </form>
      )}
    </div>
  )
}
