// Shared Tailwind class strings + a small Field wrapper for GigForm.js/
// ExpenseForm.js, so every form input looks the same without copy-pasting
// long className strings into each field.

export const fieldLabel = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50'
export const fieldInput =
  'w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-[0.95rem] text-white placeholder:text-white/30 outline-none focus:border-brand/60 transition-colors'
export const fieldHint = 'text-xs text-white/40'
export const fieldHintError = 'text-xs text-rose-400'
export const fieldHintWarning = 'text-xs text-yellow-400'
export const formCard = 'mt-5 flex w-full max-w-[480px] flex-col gap-4 rounded-2xl border border-white/[0.06] bg-ink-800 p-5 md:p-6'
export const formTitle = 'mb-1 text-xs font-bold uppercase tracking-widest text-white/40'
export const submitBtn =
  'self-start rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_-4px_rgba(34,209,126,0.5)] hover:opacity-90 transition-opacity'
export const cancelBtn =
  'self-start rounded-full border border-white/10 bg-ink-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors'
export const dangerBtn =
  'rounded-full bg-rose-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_-4px_rgba(244,63,94,0.5)] hover:opacity-90 transition-opacity'
export const checkboxLabel = 'flex cursor-pointer items-center gap-2 text-sm text-white/60'
export const calcBtn =
  'flex-none whitespace-nowrap rounded-lg bg-ink-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
export const iconBtn = 'rounded px-2 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white/40 hover:bg-white/10 hover:text-white transition-colors'
export const iconBtnDanger = 'rounded px-2 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition-colors'

export function Field({ label, htmlFor, hint, hintClassName, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className={fieldLabel}>
          {label}
        </label>
      )}
      {children}
      {hint && <p className={hintClassName || fieldHint}>{hint}</p>}
    </div>
  )
}
