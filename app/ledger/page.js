export const dynamic = 'force-dynamic'

import { getGigs, getExpenses, getRecentGigsForDropdown } from './db'
import { addGig, addExpense, logout } from './actions'
import { GIG_TYPES, EXPENSE_CATEGORIES, categoryLabel } from './categories'
import { mileageDeduction } from './mileage'

export const metadata = { title: 'Ledger' }

export default async function LedgerDashboard() {
  const [gigs, expenses, recentGigs] = await Promise.all([
    getGigs(),
    getExpenses(),
    getRecentGigsForDropdown(),
  ])

  const totalIncome = gigs.reduce((sum, g) => sum + Number(g.gross_payment), 0)
  const totalMileageDeduction = gigs.reduce(
    (sum, g) => sum + mileageDeduction(g.gig_date, g.mileage),
    0
  )
  const expenseLineTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalExpenses = expenseLineTotal + totalMileageDeduction
  const net = totalIncome - totalExpenses

  const expensesByGig = {}
  const generalExpenses = []
  for (const e of expenses) {
    if (e.gig_id) {
      ;(expensesByGig[e.gig_id] ??= []).push(e)
    } else {
      generalExpenses.push(e)
    }
  }

  return (
    <>
      <nav className="ldg-nav">
        <span className="ldg-brand">[LEDGER]</span>
        <div className="ldg-nav-links">
          <a href="/ledger/report">[REPORT]</a>
          <a href="/api/ledger/export">[EXPORT CSV]</a>
          <form action={logout} style={{ display: 'inline' }}>
            <button type="submit" className="ldg-link-btn">[LOG OUT]</button>
          </form>
        </div>
      </nav>

      <section className="ldg-totals">
        <div className="ldg-total">
          <span>Income (all-time)</span>
          <strong>${totalIncome.toFixed(2)}</strong>
        </div>
        <div className="ldg-total">
          <span>Expenses (all-time)</span>
          <strong>${totalExpenses.toFixed(2)}</strong>
        </div>
        <div className="ldg-total">
          <span>Mileage deduction</span>
          <strong>${totalMileageDeduction.toFixed(2)}</strong>
        </div>
        <div className={`ldg-total ${net < 0 ? 'ldg-negative' : ''}`}>
          <span>Net</span>
          <strong>${net.toFixed(2)}</strong>
        </div>
      </section>

      <section className="ldg-forms">
        <form action={addGig} className="ldg-form">
          <p className="ldg-form-title">FIG. 1 — Add gig</p>

          <div className="ldg-field">
            <label htmlFor="gigDate">Date</label>
            <input type="date" id="gigDate" name="gigDate" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="client">Client / venue</label>
            <input type="text" id="client" name="client" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="gigType">Type</label>
            <select id="gigType" name="gigType" defaultValue="photography">
              {GIG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="grossPayment">Gross payment ($)</label>
            <input type="number" step="0.01" min="0" id="grossPayment" name="grossPayment" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="paymentMethod">Payment method</label>
            <input type="text" id="paymentMethod" name="paymentMethod" placeholder="Venmo, Zelle, check…" />
          </div>

          <div className="ldg-field">
            <label htmlFor="datePaid">Date paid</label>
            <input type="date" id="datePaid" name="datePaid" />
          </div>

          <div className="ldg-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="paid">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="mileage">Mileage (round trip)</label>
            <input type="number" step="0.1" min="0" id="mileage" name="mileage" placeholder="e.g. 24" />
            <p className="ldg-hint">An estimate from Google Maps is fine — doesn't need to be exact.</p>
          </div>

          <div className="ldg-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" />
          </div>

          <button type="submit" className="ldg-btn">Add gig</button>
        </form>

        <form action={addExpense} className="ldg-form">
          <p className="ldg-form-title">FIG. 2 — Add expense</p>

          <div className="ldg-field">
            <label htmlFor="expenseDate">Date</label>
            <input type="date" id="expenseDate" name="expenseDate" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="supplies">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="gigId">Linked gig</label>
            <select id="gigId" name="gigId" defaultValue="">
              <option value="">General (not tied to a gig)</option>
              {recentGigs.map((g) => (
                <option key={g.id} value={g.id}>
                  {new Date(g.gig_date).toLocaleDateString()} — {g.client}
                </option>
              ))}
            </select>
          </div>

          <div className="ldg-field">
            <label htmlFor="amount">Amount ($)</label>
            <input type="number" step="0.01" min="0" id="amount" name="amount" required />
          </div>

          <div className="ldg-field">
            <label htmlFor="vendor">Vendor</label>
            <input type="text" id="vendor" name="vendor" />
          </div>

          <div className="ldg-field">
            <label htmlFor="description">Description</label>
            <input type="text" id="description" name="description" />
          </div>

          <button type="submit" className="ldg-btn">Add expense</button>
        </form>
      </section>

      <section className="ldg-list">
        <p className="ldg-form-title">FIG. 3 — Gigs</p>
        {gigs.length === 0 && <p className="ldg-empty">No gigs logged yet.</p>}
        {gigs.map((g, i) => (
          <div className="ldg-entry" key={g.id}>
            <div className="ldg-entry-head">
              <span className="ldg-entry-num">{String(gigs.length - i).padStart(3, '0')}</span>
              <span className="ldg-entry-date">{new Date(g.gig_date).toLocaleDateString()}</span>
              <span className="ldg-entry-client">{g.client}</span>
              <span className="ldg-entry-type">{g.gig_type}</span>
              <span className={`ldg-status ldg-status-${g.status}`}>{g.status}</span>
              <span className="ldg-entry-amount">${Number(g.gross_payment).toFixed(2)}</span>
            </div>
            {Number(g.mileage) > 0 && (
              <div className="ldg-entry-sub">
                Mileage: {g.mileage} mi → ${mileageDeduction(g.gig_date, g.mileage).toFixed(2)} deduction (est.)
              </div>
            )}
            {g.notes && <div className="ldg-entry-sub">{g.notes}</div>}
            {(expensesByGig[g.id] || []).map((e) => (
              <div className="ldg-expense-row" key={e.id}>
                <span>{categoryLabel(e.category)}</span>
                <span>{e.vendor || '—'}</span>
                <span>${Number(e.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </section>

      {generalExpenses.length > 0 && (
        <section className="ldg-list">
          <p className="ldg-form-title">FIG. 4 — General expenses</p>
          {generalExpenses.map((e) => (
            <div className="ldg-expense-row" key={e.id}>
              <span>{new Date(e.expense_date).toLocaleDateString()}</span>
              <span>{categoryLabel(e.category)}</span>
              <span>{e.vendor || '—'}</span>
              <span>${Number(e.amount).toFixed(2)}</span>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
