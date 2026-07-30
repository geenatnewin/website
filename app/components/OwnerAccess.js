'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const USERNAME_KEY = 'ledgerUsername'

export default function OwnerAccess() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberedUsername, setRememberedUsername] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    setRememberedUsername(localStorage.getItem(USERNAME_KEY) || '')
  }, [])

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
    const effectiveUsername = rememberedUsername || username
    try {
      const res = await fetch('/api/ledger/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: effectiveUsername, password }),
      })
      if (res.ok) {
        if (!rememberedUsername) {
          if (remember) localStorage.setItem(USERNAME_KEY, effectiveUsername)
          else localStorage.removeItem(USERNAME_KEY)
        }
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

  function forgetUsername() {
    localStorage.removeItem(USERNAME_KEY)
    setRememberedUsername('')
    setUsername('')
  }

  if (pathname?.startsWith('/ledger')) return null

  return (
    <div className="owner-access" ref={wrapRef}>
      {!open ? (
        <button
          type="button"
          className="owner-access-trigger"
          onClick={() => setOpen(true)}
          aria-label="Admin access"
        >
          admin access
        </button>
      ) : (
        <form className="owner-access-form" onSubmit={handleSubmit}>
          <div className="owner-access-row">
            {!rememberedUsername && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoFocus
                disabled={locked}
                autoComplete="username"
                className="owner-access-input"
              />
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoFocus={Boolean(rememberedUsername)}
              disabled={locked}
              autoComplete="current-password"
              className="owner-access-input"
            />
            <button type="submit" className="owner-access-go" disabled={loading || locked} aria-label="Enter">→</button>
          </div>
          <div className="owner-access-meta">
            {!rememberedUsername ? (
              <label className="owner-access-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                remember username
              </label>
            ) : (
              <button type="button" className="owner-access-forget" onClick={forgetUsername}>not you?</button>
            )}
            {error && (
              <span className="owner-access-error">
                wrong{remaining != null ? ` — ${remaining} left` : ''}
              </span>
            )}
            {locked && <span className="owner-access-error">locked 10 min</span>}
          </div>
        </form>
      )}
    </div>
  )
}
