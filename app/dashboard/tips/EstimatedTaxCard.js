'use client'

import { useState } from 'react'
import { formatMoney } from '../format'
import { ReportRow, ReportCard } from '../ReportUI'
import { Field, fieldInput } from '../FormField'

export default function EstimatedTaxCard({ ytdIncome, ytdExpenses, netProfit }) {
  const [rate, setRate] = useState(27)
  const estimatedTax = Math.max(0, netProfit * (rate / 100))

  return (
    <ReportCard title={`Estimated tax to set aside (${new Date().getFullYear()} YTD)`}>
      <p className="mb-5 text-xs text-white/40">
        A rough estimate only — not a substitute for what your preparer tells you. Real self-employment
        tax is ~15.3%; the rest depends on your income tax bracket, filing status, and other income.
        25–30% combined is a common starting rule of thumb.
      </p>

      <ReportRow>
        <span>YTD income</span>
        <span>${formatMoney(ytdIncome)}</span>
      </ReportRow>
      <ReportRow>
        <span>YTD deductible expenses (incl. mileage)</span>
        <span>${formatMoney(ytdExpenses)}</span>
      </ReportRow>
      <ReportRow className="border-t-2 border-white/10 pt-3 text-base font-bold">
        <span>YTD net profit</span>
        <span>${formatMoney(netProfit)}</span>
      </ReportRow>

      <div className="mt-5 max-w-[220px]">
        <Field label="Set-aside rate (%)" htmlFor="taxRate" hint="Adjust to match what your preparer told you, or leave the default rough estimate.">
          <input
            type="number"
            id="taxRate"
            min="0"
            max="60"
            step="1"
            className={fieldInput}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <ReportRow className={`mt-3 border-none pt-1 text-base font-bold ${estimatedTax > 0 ? 'text-brand-soft' : ''}`}>
        <span>Suggested amount set aside so far this year</span>
        <span>${formatMoney(estimatedTax)}</span>
      </ReportRow>
    </ReportCard>
  )
}
