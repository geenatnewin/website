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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:bg-ink-700 transition-colors"
        >
          &#10005;
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Receipt" className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  )
}
