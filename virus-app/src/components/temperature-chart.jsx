export function TemperatureChart({ data, height = 140 }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground"
        style={{ height }}
      >
        No temperature readings yet
      </div>
    )
  }

  const width = 320
  const padX = 28
  const padY = 18
  const values = data.map((d) => d.value)
  const min = Math.min(36, ...values) - 0.3
  const max = Math.max(40, ...values) + 0.3
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padX + (i * (width - padX * 2)) / Math.max(1, data.length - 1)
    const y = padY + (1 - (d.value - min) / range) * (height - padY * 2)
    return { x, y, ...d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  // Fever threshold line at 38C
  const feverY = padY + (1 - (38 - min) / range) * (height - padY * 2)

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Temperature trend chart">
      <line
        x1={padX}
        x2={width - padX}
        y1={feverY}
        y2={feverY}
        stroke="var(--color-destructive)"
        strokeDasharray="4 4"
        strokeWidth="1"
        opacity="0.5"
      />
      <text x={width - padX} y={feverY - 4} textAnchor="end" fontSize="9" fill="var(--color-destructive)">
        fever 38°
      </text>
      <path d={linePath} fill="none" stroke="var(--color-chart-1)" strokeWidth="2" strokeLinecap="round" />
      {points.map((p) => (
        <g key={p.date}>
          <circle
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill={p.value >= 38 ? 'var(--color-destructive)' : 'var(--color-chart-1)'}
          />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="var(--color-foreground)">
            {p.value}
          </text>
        </g>
      ))}
    </svg>
  )
}
