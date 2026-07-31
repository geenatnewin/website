'use client'

import { useState } from 'react'

export default function RevealAmount({ value, className = '', onRevealChange }) {
  const [revealed, setRevealed] = useState(false)

  function toggle() {
    setRevealed((r) => {
      const next = !r
      onRevealChange?.(next)
      return next
    })
  }

  return (
    <strong
      className={`${revealed ? 'ldg-revealed' : 'ldg-censored'} ${className}`}
      onClick={toggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
      title={revealed ? 'Click to hide' : 'Click to reveal'}
    >
      {value}
    </strong>
  )
}
