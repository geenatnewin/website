'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      className="ldg-btn ldg-no-print"
      onClick={() => window.print()}
    >
      Print / save as PDF
    </button>
  )
}
