'use client'

import { useEffect, useRef, useState } from 'react'
import RevealAmount from './RevealAmount'

const TONE_TEXT = {
  brand: 'text-brand-soft',
  neutral: 'text-white/85',
  good: 'text-emerald-400',
  critical: 'text-rose-400',
}

// Outlined, not gradient-filled — the accent is a small touch (value color),
// not the whole card painted a color.
//
// Glow is a transient "good news" flash, not a static decoration: it only
// fires when rawValue goes UP from what it was a moment ago (money coming
// in) on cards where that's actually good news (canGlow) — never on a
// decrease, and never on Expenses (an increase there is money going out,
// not "added"). Revealing the number (un-blurring it) immediately clears
// any active glow so it doesn't linger once you're actually looking at it.
export default function StatCard({ label, value, rawValue, tone = 'neutral', canGlow = false }) {
  const previousValue = useRef(rawValue)
  const [glowing, setGlowing] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (canGlow && rawValue > previousValue.current) {
      setGlowing(true)
      const timer = setTimeout(() => setGlowing(false), 2200)
      previousValue.current = rawValue
      return () => clearTimeout(timer)
    }
    previousValue.current = rawValue
  }, [rawValue, canGlow])

  const showGlow = glowing && !revealed

  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-ink-800 p-4 md:p-5 transition-shadow duration-500 ${
        showGlow ? 'shadow-[0_10px_28px_-10px_rgba(34,209,126,0.5)]' : 'shadow-[0_6px_16px_rgba(0,0,0,0.18)]'
      }`}
    >
      <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-white/40">{label}</span>
      <RevealAmount
        value={value}
        onRevealChange={setRevealed}
        className={`mt-1.5 block text-xl font-extrabold md:text-2xl ${TONE_TEXT[tone]}`}
      />
    </div>
  )
}
