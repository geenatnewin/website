import { login } from '../actions'

export const metadata = { title: 'Ledger — Login' }

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const hasError = params?.error

  return (
    <div className="ldg-login-wrap">
      <div className="ldg-login-box">
        <p className="ldg-brand">[LEDGER]</p>
        <form action={login} className="ldg-login-form">
          <label className="ldg-label" htmlFor="password">Password</label>
          <input
            className="ldg-input"
            type="password"
            id="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
          />
          <button className="ldg-btn" type="submit">Enter</button>
          {hasError && <p className="ldg-error">Wrong password.</p>}
        </form>
      </div>
    </div>
  )
}
