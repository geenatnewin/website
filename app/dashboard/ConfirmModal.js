'use client'

import { useEffect } from 'react'

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
    <div className="ldg-modal-overlay" onClick={onCancel}>
      <div className="ldg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ldg-modal-title">{title}</div>
        <p className="ldg-modal-message">{message}</p>
        <div className="ldg-modal-actions">
          <button type="button" className="ldg-btn ldg-btn-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="ldg-btn ldg-btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
