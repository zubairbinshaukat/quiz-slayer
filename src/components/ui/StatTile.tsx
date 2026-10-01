import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface StatTileProps {
  label: string
  value: ReactNode
  /** Tailwind text-* class for the number */
  tone?: string
  /** Tiny sparkline / ring beside the number */
  visual?: ReactNode
  /** Extra line under the number (e.g. a chip) */
  footer?: ReactNode
  index?: number
  className?: string
}

/** One number with a label and an optional mini visual (use inside a <dl>). */
export function StatTile({ label, value, tone, visual, footer, index = 0, className }: StatTileProps) {
  return (
    <div className={cn('card rise flex min-w-0 flex-col gap-2.5 p-3.5 sm:p-4', className)} style={{ '--i': index } as CSSProperties}>
      <dt className="eyebrow truncate">{label}</dt>
      {/* A <dl> group may only hold dt/dd, so the visual and footer live inside the dd */}
      <dd className="mt-auto flex flex-col gap-2.5">
        <span className="flex items-end justify-between gap-2">
          <span className={cn('text-2xl font-extrabold leading-none tracking-[-0.02em] tabular-nums sm:text-[28px]', tone)}>{value}</span>
          {visual && <span className="shrink-0" aria-hidden="true">{visual}</span>}
        </span>
        {footer}
      </dd>
    </div>
  )
}
