'use client'

import { useEffect } from 'react'
import { cancelBtn, dangerBtn } from './FormField'

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl border border-white/[0.06] bg-ink-800 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-base font-bold text-white">{title}</div>
        <p className="mb-6 text-sm leading-relaxed text-white/60">{message}</p>
        <div className="flex justify-end gap-3">
          <button type="button" className={cancelBtn} onClick={onCancel}>Cancel</button>
          <button type="button" className={dangerBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
