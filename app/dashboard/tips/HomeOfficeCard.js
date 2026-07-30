'use client'

import { useState } from 'react'
import { formatMoney } from '../format'

const SIMPLIFIED_RATE = 5
const SIMPLIFIED_MAX_SQFT = 300

export default function HomeOfficeCard() {
  const [officeSqFt, setOfficeSqFt] = useState('')
  const [homeSqFt, setHomeSqFt] = useState('')
  const [annualHomeExpenses, setAnnualHomeExpenses] = useState('')

  const office = Number(officeSqFt) || 0
  const home = Number(homeSqFt) || 0
  const homeExpenses = Number(annualHomeExpenses) || 0

  const simplified = Math.min(office, SIMPLIFIED_MAX_SQFT) * SIMPLIFIED_RATE
  const businessPct = home > 0 ? Math.min(office / home, 1) : 0
  const regular = businessPct * homeExpenses

  const hasInputs = office > 0
  const betterMethod = regular > simplified ? 'regular' : 'simplified'

  return (
    <section className="ldg-card">
      <p className="ldg-card-title">Home office deduction</p>
      <p className="ldg-hint" style={{ marginBottom: '1.25rem' }}>
        If you have a space used regularly and exclusively for business (editing, calls, gear
        storage), you can deduct it one of two ways. This just estimates both so you can see which
        is bigger — ask your preparer which to actually file with (Form 8829 for the regular method).
      </p>

      <div className="ldg-field">
        <label htmlFor="officeSqFt">Home office square footage</label>
        <input
          type="number"
          id="officeSqFt"
          min="0"
          step="1"
          value={officeSqFt}
          onChange={(e) => setOfficeSqFt(e.target.value)}
          placeholder="e.g. 120"
        />
      </div>

      <div className="ldg-field">
        <label htmlFor="homeSqFt">Total home square footage</label>
        <input
          type="number"
          id="homeSqFt"
          min="0"
          step="1"
          value={homeSqFt}
          onChange={(e) => setHomeSqFt(e.target.value)}
          placeholder="e.g. 1200"
        />
      </div>

      <div className="ldg-field">
        <label htmlFor="annualHomeExpenses">Total annual home costs ($)</label>
        <input
          type="number"
          id="annualHomeExpenses"
          min="0"
          step="1"
          value={annualHomeExpenses}
          onChange={(e) => setAnnualHomeExpenses(e.target.value)}
          placeholder="Rent or mortgage interest + utilities + insurance + repairs"
        />
        <p className="ldg-hint">Only needed for the regular method comparison below.</p>
      </div>

      {hasInputs && (
        <>
          <div className={`ldg-report-row ${betterMethod === 'simplified' ? 'ldg-report-total ldg-positive' : ''}`}>
            <span>
              Simplified method <span className="ldg-report-sub">${SIMPLIFIED_RATE}/sq ft, capped at {SIMPLIFIED_MAX_SQFT} sq ft</span>
            </span>
            <span>${formatMoney(simplified)}</span>
          </div>
          <div className={`ldg-report-row ${betterMethod === 'regular' ? 'ldg-report-total ldg-positive' : ''}`}>
            <span>
              Regular method <span className="ldg-report-sub">{(businessPct * 100).toFixed(1)}% business use</span>
            </span>
            <span>${formatMoney(regular)}</span>
          </div>
          <p className="ldg-hint" style={{ marginTop: '0.5rem' }}>
            The regular method needs receipts for every home cost included above — the simplified
            method needs none, just the square footage.
          </p>
        </>
      )}
    </section>
  )
}
