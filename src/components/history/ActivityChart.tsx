import type { CSSProperties } from 'react'
import type { DayCount } from '../../lib/streak'

const W = 300
const H = 96
const PAD_BOTTOM = 18
const GAP = 5

function weekday(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'narrow' })
}

/** 14-day attempts bar chart (inline SVG, amber bars, today outlined). */
export function ActivityChart({ days }: { days: DayCount[] }) {
  const max = Math.max(1, ...days.map((d) => d.count))
  const plotH = H - PAD_BOTTOM
  const slot = W / Math.max(1, days.length)
  const barW = slot - GAP
  const total = days.reduce((s, d) => s + d.count, 0)
  const activeDays = days.filter((d) => d.count > 0).length

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">Last {days.length} days</span>
        <span className="font-mono text-xs text-muted">
          {total} attempt{total === 1 ? '' : 's'} · {activeDays} active day{activeDays === 1 ? '' : 's'}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 block h-auto w-full"
        role="img"
        aria-label={`Attempts per day for the last ${days.length} days: ${total} in total, on ${activeDays} days`}
      >
        <line x1={0} x2={W} y1={plotH + 0.5} y2={plotH + 0.5} stroke="var(--color-line-strong)" strokeWidth={1} />
        {days.map((d, i) => {
          const h = d.count > 0 ? Math.max(6, (d.count / max) * (plotH - 6)) : 3
          const x = i * slot + GAP / 2
          const today = i === days.length - 1
          return (
            <g key={d.key}>
              <rect
                x={x}
                y={plotH - h}
                width={barW}
                height={h}
                rx={Math.min(4, barW / 2)}
                fill={d.count > 0 ? 'var(--color-accent)' : 'var(--color-surface-3)'}
                opacity={d.count > 0 ? 0.5 + 0.5 * (d.count / max) : 1}
                className="bar-grow"
                style={{ '--i': i } as CSSProperties}
              >
                <title>{`${d.key}: ${d.count} attempt${d.count === 1 ? '' : 's'}`}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={H - 4}
                textAnchor="middle"
                fontSize={9}
                fontWeight={today ? 700 : 500}
                fill={today ? 'var(--color-fg)' : 'var(--color-muted)'}
              >
                {weekday(d.key)}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
