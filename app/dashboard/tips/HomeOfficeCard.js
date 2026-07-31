'use client'

import { useState } from 'react'
import { formatMoney } from '../format'
import { ReportRow, ReportCard } from '../ReportUI'
import { Field, fieldInput, fieldHint } from '../FormField'

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
    <ReportCard title="Home office deduction">
      <p className="mb-5 text-xs text-white/40">
        If you have a space used regularly and exclusively for business (editing, calls, gear
        storage), you can deduct it one of two ways. This just estimates both so you can see which
        is bigger — ask your preparer which to actually file with (Form 8829 for the regular method).
      </p>

      <div className="flex flex-col gap-4">
        <Field label="Home office square footage" htmlFor="officeSqFt">
          <input
            type="number"
            id="officeSqFt"
            min="0"
            step="1"
            className={fieldInput}
            value={officeSqFt}
            onChange={(e) => setOfficeSqFt(e.target.value)}
            placeholder="e.g. 120"
          />
        </Field>

        <Field label="Total home square footage" htmlFor="homeSqFt">
          <input
            type="number"
            id="homeSqFt"
            min="0"
            step="1"
            className={fieldInput}
            value={homeSqFt}
            onChange={(e) => setHomeSqFt(e.target.value)}
            placeholder="e.g. 1200"
          />
        </Field>

        <Field
          label="Total annual home costs ($)"
          htmlFor="annualHomeExpenses"
          hint="Only needed for the regular method comparison below."
        >
          <input
            type="number"
            id="annualHomeExpenses"
            min="0"
            step="1"
            className={fieldInput}
            value={annualHomeExpenses}
            onChange={(e) => setAnnualHomeExpenses(e.target.value)}
            placeholder="Rent or mortgage interest + utilities + insurance + repairs"
          />
        </Field>
      </div>

      {hasInputs && (
        <div className="mt-4">
          <ReportRow className={betterMethod === 'simplified' ? 'border-none pt-1 text-base font-bold text-brand-soft' : ''}>
            <span>
              Simplified method <span className="ml-2 text-xs text-white/40">${SIMPLIFIED_RATE}/sq ft, capped at {SIMPLIFIED_MAX_SQFT} sq ft</span>
            </span>
            <span>${formatMoney(simplified)}</span>
          </ReportRow>
          <ReportRow className={betterMethod === 'regular' ? 'border-none pt-1 text-base font-bold text-brand-soft' : ''}>
            <span>
              Regular method <span className="ml-2 text-xs text-white/40">{(businessPct * 100).toFixed(1)}% business use</span>
            </span>
            <span>${formatMoney(regular)}</span>
          </ReportRow>
          <p className={`mt-2 ${fieldHint}`}>
            The regular method needs receipts for every home cost included above — the simplified
            method needs none, just the square footage.
          </p>
        </div>
      )}
    </ReportCard>
  )
}
