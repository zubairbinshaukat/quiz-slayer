import type { WeekDay } from '../../lib/streak'
import { cn } from '../../lib/utils'
import { Icon3D } from '../ui/Icon3D'

interface StreakDotsProps {
  week: WeekDay[]
  streak: number
  /** Show the fire + count at the end of the row. */
  showCount?: boolean
  className?: string
}

/** Mo–Su row: filled amber for study days, a ring for today, fire + count at the end. */
export function StreakDots({ week, streak, showCount = true, className }: StreakDotsProps) {
  const studied = week.filter((d) => d.studied).length
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ol className="flex flex-1 items-end justify-between gap-1.5" aria-label={`Studied ${studied} of 7 days this week`}>
        {week.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                'flex size-7 items-center justify-center rounded-full border-2',
                d.studied
                  ? 'border-accent bg-accent shadow-[0_0_0_3px_rgb(245_183_58/0.14)]'
                  : d.today
                    ? 'border-accent/80 bg-transparent'
                    : 'border-line-strong bg-surface-2',
                d.future && 'opacity-50',
              )}
            >
              {d.studied && (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-accent-ink)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className={cn('text-[11px] font-semibold', d.today ? 'text-fg' : 'text-muted')}>
              {d.label}
              <span className="sr-only">{d.studied ? ', studied' : d.today ? ', today' : ''}</span>
            </span>
          </li>
        ))}
      </ol>
      {showCount && (
        <span className="flex shrink-0 items-center gap-0.5 self-start" aria-label={`${streak} day streak`}>
          <Icon3D name="fire" size={30} eager />
          <span className="font-mono text-lg font-extrabold">{streak}</span>
        </span>
      )}
    </div>
  )
}
