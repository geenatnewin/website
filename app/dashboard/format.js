export function formatMoney(amount, decimals = 2) {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Receipt R2 keys carry their original extension (see uploadReceipt() in r2.js) — a PDF
// can't render in an <img>/lightbox, so callers need to know to link out instead.
export function isPdfKey(key) {
  return typeof key === 'string' && key.toLowerCase().endsWith('.pdf')
}
