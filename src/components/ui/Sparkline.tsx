interface SparklineProps {
  values: number[]
  kind?: 'bars' | 'line'
  width?: number
  height?: number
  /** CSS colour */
  color?: string
}

/** Decorative inline mini chart (the tile shows the real number). */
export function Sparkline({ values, kind = 'bars', width = 64, height = 28, color = 'var(--color-info)' }: SparklineProps) {
  const max = Math.max(1, ...values)
  const n = Math.max(1, values.length)

  if (kind === 'line') {
    const step = n > 1 ? width / (n - 1) : 0
    const pts = values.map((v, i) => [i * step, height - 3 - (v / max) * (height - 6)] as const)
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
    const last = pts[pts.length - 1]
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {values.length > 1 && (
          <>
            <path d={`${d}L${width} ${height}L0 ${height}Z`} fill={color} opacity={0.12} />
            <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {last && <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />}
      </svg>
    )
  }

  const slot = width / n
  const barW = Math.max(2, slot - 2)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {values.map((v, i) => {
        const h = v > 0 ? Math.max(3, (v / max) * height) : 2
        return (
          <rect
            key={i}
            x={i * slot + (slot - barW) / 2}
            y={height - h}
            width={barW}
            height={h}
            rx={Math.min(1.5, barW / 2)}
            fill={v > 0 ? color : 'var(--color-line-strong)'}
          />
        )
      })}
    </svg>
  )
}
