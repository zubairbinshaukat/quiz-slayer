import { useId, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ProgressRingProps {
  /** 0–1 */
  value: number
  size?: number
  stroke?: number
  className?: string
  /** Tailwind text-* class for a solid arc. Ignored when `gradient` is set. */
  tone?: string
  /** Amber → #FFC857 gradient arc (mastery / score rings). */
  gradient?: boolean
  label?: string
  children?: ReactNode
}

/** Circular progress; the arc draws in from 0 on mount (motion.css `.ring-arc`). */
export function ProgressRing({ value, size = 44, stroke = 3, className, tone = 'text-accent', gradient = false, label, children }: ProgressRingProps) {
  const gradId = `ring${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, value))
  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(pct * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5B73A" />
              <stop offset="100%" stopColor="#FFC857" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line-strong" />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={gradient ? `url(#${gradId})` : 'currentColor'}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className={cn('ring-arc', !gradient && tone)}
            style={{ '--ring-c': c } as CSSProperties}
          />
        )}
      </svg>
      {children && <span className="absolute inset-0 flex items-center justify-center">{children}</span>}
    </div>
  )
}
