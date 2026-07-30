import { formatMoney } from '../format'

export default function CategoryDonut({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  if (total <= 0) return <p className="ldg-empty">No expenses yet.</p>

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const gap = 4
  let offset = 0

  return (
    <div className="ldg-donut-wrap">
      <svg viewBox="0 0 160 160" className="ldg-donut">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--gridline)" strokeWidth="22" />
        {segments.map((seg) => {
          const fraction = seg.value / total
          const rawDash = fraction * circumference
          const dash = Math.max(rawDash - gap, 0)
          const el = (
            <circle
              key={seg.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={`var(--chart-${seg.color})`}
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          )
          offset += rawDash
          return el
        })}
      </svg>
      <ul className="ldg-donut-legend">
        {segments.map((seg) => (
          <li key={seg.label}>
            <span className="ldg-legend-dot" style={{ background: `var(--chart-${seg.color})` }} />
            <span>{seg.label}</span>
            <span className="ldg-legend-value">${formatMoney(seg.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
