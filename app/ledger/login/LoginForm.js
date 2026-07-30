'use client'

import { useEffect, useState } from 'react'

const USERNAME_KEY = 'ledgerUsername'

export default function LoginForm({ login }) {
  const [remembered, setRemembered] = useState('')
  const [remember, setRemember] = useState(true)
  const [username, setUsername] = useState('')

  useEffect(() => {
    setRemembered(localStorage.getItem(USERNAME_KEY) || '')
  }, [])

  function handleSubmit() {
    if (!remembered) {
      if (remember && username) localStorage.setItem(USERNAME_KEY, username)
      else localStorage.removeItem(USERNAME_KEY)
    }
  }

  function forget() {
    localStorage.removeItem(USERNAME_KEY)
    setRemembered('')
  }

  return (
    <form action={login} onSubmit={handleSubmit} className="ldg-login-form">
      {remembered ? (
        <>
          <input type="hidden" name="username" value={remembered} />
          <p className="ldg-login-remembered">
            Signed in as <strong>{remembered}</strong> —{' '}
            <button type="button" className="ldg-forget-link" onClick={forget}>not you?</button>
          </p>
        </>
      ) : (
        <>
          <label className="ldg-label" htmlFor="username">Username</label>
          <input
            className="ldg-input"
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
        </>
      )}

      <label className="ldg-label" htmlFor="password">Password</label>
      <input
        className="ldg-input"
        type="password"
        id="password"
        name="password"
        required
        autoFocus={Boolean(remembered)}
        autoComplete="current-password"
      />

      {!remembered && (
        <label className="ldg-remember-username">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember username on this device
        </label>
      )}

      <button className="ldg-btn" type="submit">Enter</button>
    </form>
  )
}
