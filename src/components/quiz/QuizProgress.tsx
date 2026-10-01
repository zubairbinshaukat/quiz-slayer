import { cn } from '../../lib/utils'

/** 'answered' is used in timed exams, where correctness stays hidden until submit. */
export type QuestionStatus = 'correct' | 'wrong' | 'answered' | 'open'

interface QuizProgressProps {
  statuses: QuestionStatus[]
  current: number
}

const MAX_DOTS = 20

/** ≤20 questions: a row of dots that fill amber, current one elongated. More: a continuous bar. */
export function QuizProgress({ statuses, current }: QuizProgressProps) {
  const total = statuses.length
  const answered = statuses.filter((s) => s !== 'open').length
  const aria = {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': total,
    'aria-valuenow': answered,
    'aria-label': `${answered} of ${total} answered`,
  } as const

  if (total > MAX_DOTS) {
    return (
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3" {...aria}>
        <div
          className="h-full rounded-full bg-linear-to-r from-accent to-accent-hover transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(1.5, (answered / total) * 100)}%` }}
        />
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5" {...aria}>
      {statuses.map((s, i) => {
        const isCurrent = i === current
        return (
          <span
            key={i}
            className={cn(
              'h-2 shrink-0 rounded-full transition-[width,background-color] duration-300 ease-out',
              isCurrent ? 'w-6 bg-accent shadow-[0_0_0_3px_rgb(245_183_58/0.16)]' : 'w-2',
              !isCurrent && (s !== 'open' ? 'bg-accent' : 'bg-line-strong'),
            )}
          />
        )
      })}
    </div>
  )
}
