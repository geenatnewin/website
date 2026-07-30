import { formatMoney } from '../format'

export default function QuarterBars({ quarters, currentIndex }) {
  const chartHeight = 140
  const zeroY = chartHeight / 2
  const barWidth = 44
  const gap = 28
  const unit = barWidth + gap
  const maxAbs = Math.max(1, ...quarters.map((q) => Math.abs(q.income - q.expenses)))

  return (
    <svg viewBox={`0 0 ${quarters.length * unit} ${chartHeight + 28}`} className="ldg-bar-chart">
      <line x1="0" y1={zeroY} x2={quarters.length * unit} y2={zeroY} className="ldg-bar-zeroline" />
      {quarters.map((q, i) => {
        const net = q.income - q.expenses
        const h = (Math.abs(net) / maxAbs) * (zeroY - 12)
        const x = i * unit + gap / 2
        const y = net >= 0 ? zeroY - h : zeroY
        const barClass = net >= 0 ? 'ldg-bar-good' : 'ldg-bar-critical'
        const hasBar = Math.abs(net) > 0.004
        return (
          <g key={q.label}>
            {hasBar && (
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="4"
                className={`${barClass} ${i === currentIndex ? 'ldg-bar-current' : ''}`}
              />
            )}
            <text
              x={x + barWidth / 2}
              y={hasBar ? (net >= 0 ? y - 6 : y + h + 14) : zeroY - 8}
              textAnchor="middle"
              className="ldg-bar-value"
            >
              ${formatMoney(net, 0)}
            </text>
            <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" className="ldg-bar-label">
              {q.label}{i === currentIndex ? ' •' : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
