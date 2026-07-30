'use client'

import { useEffect } from 'react'

export default function ReceiptLightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [src, onClose])

  if (!src) return null

  return (
    <div className="ldg-modal-overlay" onClick={onClose}>
      <div className="ldg-receipt-lightbox" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ldg-receipt-lightbox-close" onClick={onClose} aria-label="Close">✕</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Receipt" className="ldg-receipt-lightbox-img" />
      </div>
    </div>
  )
}
