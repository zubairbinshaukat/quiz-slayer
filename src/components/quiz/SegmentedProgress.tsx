import { cn } from '../../lib/utils'

/** 'answered' is used in timed exams, where correctness stays hidden until submit. */
export type QuestionStatus = 'correct' | 'wrong' | 'answered' | 'open'

interface SegmentedProgressProps {
  statuses: QuestionStatus[]
  current: number
}

const MAX_SEGMENTS = 30

/** One segment per question (≤30), otherwise a continuous answered-bar. */
export function SegmentedProgress({ statuses, current }: SegmentedProgressProps) {
  const total = statuses.length
  const answered = statuses.filter((s) => s !== 'open').length
  const label = `${answered} of ${total} answered`

  if (total > MAX_SEGMENTS) {
    return (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered} aria-label={label}>
        <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${(answered / total) * 100}%` }} />
      </div>
    )
  }

  return (
    <div className="flex w-full gap-[3px]" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered} aria-label={label}>
      {statuses.map((s, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-colors duration-200',
            s === 'correct' ? 'bg-success' : s === 'wrong' ? 'bg-danger' : s === 'answered' ? 'bg-fg/55' : 'bg-surface-2',
            i === current && 'ring-2 ring-accent ring-offset-1 ring-offset-bg',
            i === current && s === 'open' && 'bg-accent',
          )}
        />
      ))}
    </div>
  )
}
