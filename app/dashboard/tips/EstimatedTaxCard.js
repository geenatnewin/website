'use client'

import { useState } from 'react'
import { formatMoney } from '../format'

export default function EstimatedTaxCard({ ytdIncome, ytdExpenses, netProfit }) {
  const [rate, setRate] = useState(27)
  const estimatedTax = Math.max(0, netProfit * (rate / 100))

  return (
    <section className="ldg-card">
      <p className="ldg-card-title">Estimated tax to set aside ({new Date().getFullYear()} YTD)</p>
      <p className="ldg-hint" style={{ marginBottom: '1.25rem' }}>
        A rough estimate only — not a substitute for what your preparer tells you. Real self-employment
        tax is ~15.3%; the rest depends on your income tax bracket, filing status, and other income.
        25–30% combined is a common starting rule of thumb.
      </p>

      <div className="ldg-report-row">
        <span>YTD income</span>
        <span>${formatMoney(ytdIncome)}</span>
      </div>
      <div className="ldg-report-row">
        <span>YTD deductible expenses (incl. mileage)</span>
        <span>${formatMoney(ytdExpenses)}</span>
      </div>
      <div className="ldg-report-row ldg-report-total">
        <span>YTD net profit</span>
        <span>${formatMoney(netProfit)}</span>
      </div>

      <div className="ldg-field" style={{ marginTop: '1.1rem', maxWidth: 220 }}>
        <label htmlFor="taxRate">Set-aside rate (%)</label>
        <input
          type="number"
          id="taxRate"
          min="0"
          max="60"
          step="1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value) || 0)}
        />
        <p className="ldg-hint">Adjust to match what your preparer told you, or leave the default rough estimate.</p>
      </div>

      <div className={`ldg-report-row ldg-report-total ${estimatedTax > 0 ? 'ldg-positive' : ''}`} style={{ marginTop: '0.75rem' }}>
        <span>Suggested amount set aside so far this year</span>
        <span>${formatMoney(estimatedTax)}</span>
      </div>
    </section>
  )
}
