import { useState } from 'react'

export interface DayPoint {
  day: string
  visits: number
  uniques: number
}

const W = 600
const H = 180
const PAD_TOP = 8
const PAD_BOTTOM = 22
const GAP = 2

function shortDate(day: string): string {
  const d = new Date(`${day}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** Visits per day as bars (single series, inline SVG). Hover/focus a bar for its numbers. */
export function VisitsChart({ points }: { points: DayPoint[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...points.map((p) => p.visits))
  const plotH = H - PAD_TOP - PAD_BOTTOM
  const slot = W / Math.max(1, points.length)
  const barW = Math.max(2, slot - GAP)
  const shown = active !== null ? points[active] : null
  const total = points.reduce((s, p) => s + p.visits, 0)

  return (
    <figure className="card p-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">Visits · last {points.length} days</span>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown ? `${shortDate(shown.day)}: ${shown.visits} visits · ${shown.uniques} unique` : `${total} total · peak ${max}`}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 block h-auto w-full" role="img" aria-label={`Daily visits for the last ${points.length} days, peak ${max}`}>
        {[0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={PAD_TOP + plotH * (1 - f)} y2={PAD_TOP + plotH * (1 - f)} stroke="var(--color-line)" strokeWidth={1} />
        ))}
        <line x1={0} x2={W} y1={PAD_TOP + plotH} y2={PAD_TOP + plotH} stroke="var(--color-line-strong)" strokeWidth={1} />
        {points.map((p, i) => {
          const h = p.visits > 0 ? Math.max(3, (p.visits / max) * plotH) : 0
          const x = i * slot + GAP / 2
          const y = PAD_TOP + plotH - h
          const r = Math.min(4, barW / 2, h)
          return (
            <g
              key={p.day}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              aria-label={`${shortDate(p.day)}: ${p.visits} visits`}
              className="outline-none"
            >
              {/* Hit target spans the whole slot, taller than the mark */}
              <rect x={i * slot} y={0} width={slot} height={PAD_TOP + plotH} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${r} ${-r}h${barW - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h}z`}
                  fill="var(--color-accent)"
                  opacity={active === null || active === i ? 1 : 0.45}
                />
              )}
            </g>
          )
        })}
        {points.length > 0 && (
          <>
            <text x={0} y={H - 6} fontSize={11} fill="var(--color-muted)">{shortDate(points[0].day)}</text>
            <text x={W} y={H - 6} fontSize={11} fill="var(--color-muted)" textAnchor="end">{shortDate(points[points.length - 1].day)}</text>
          </>
        )}
      </svg>
    </figure>
  )
}
