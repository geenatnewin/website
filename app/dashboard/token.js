// Shared by middleware.js (Edge runtime) and actions.js (Node runtime) — Web Crypto works in both.
export async function computeSessionToken() {
  const enc = new TextEncoder()
  const data = enc.encode(`${process.env.LEDGER_PASSWORD}:${process.env.LEDGER_SECRET}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const LEDGER_COOKIE = 'ledger_session'
