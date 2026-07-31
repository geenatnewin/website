'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      className="ldg-no-print rounded-full border border-white/10 bg-ink-800 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
      onClick={() => window.print()}
    >
      Print / save as PDF
    </button>
  )
}
