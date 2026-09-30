import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface Stat {
  label: string
  value: ReactNode
  tone?: string
}

/** Compact row of numbers inside one card, split by hairlines. */
export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <dl className={cn('card grid divide-x divide-line', className)} style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
      {stats.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col items-center gap-0.5 px-2 py-3.5">
          <dt className="order-2 truncate text-[11px] font-medium uppercase tracking-wider text-muted">{s.label}</dt>
          <dd className={cn('order-1 text-xl font-extrabold tracking-tight', s.tone)}>{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
