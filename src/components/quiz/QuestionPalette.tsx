import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import type { QuestionStatus } from './SegmentedProgress'

interface QuestionPaletteProps {
  statuses: QuestionStatus[]
  current: number
  onJump: (index: number) => void
}

/** Horizontal strip of numbered chips; keeps the current chip centred. */
export function QuestionPalette({ statuses, current, onJump }: QuestionPaletteProps) {
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector<HTMLElement>(`[data-index="${current}"]`)
    if (!strip || !chip) return
    const left = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2
    strip.scrollTo({ left, behavior: 'smooth' })
  }, [current])

  return (
    <nav aria-label="Question palette" className="mt-6">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Jump to</p>
      <div ref={stripRef} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1" data-lenis-prevent>
        {statuses.map((s, i) => {
          const isCurrent = i === current
          const statusLabel = s === 'open' ? 'unanswered' : s
          return (
            <button
              key={i}
              type="button"
              data-index={i}
              onClick={() => onJump(i)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Question ${i + 1}, ${statusLabel}`}
              className={cn(
                'press flex size-11 shrink-0 items-center justify-center rounded-btn border font-mono text-sm font-semibold',
                s === 'correct' && 'border-success/40 bg-success/12 text-success',
                s === 'wrong' && 'border-danger/40 bg-danger/12 text-danger',
                s === 'answered' && 'border-line-strong bg-surface-2 text-fg',
                s === 'open' && 'border-line bg-surface text-muted',
                isCurrent && 'border-accent ring-2 ring-accent/40',
                isCurrent && s === 'open' && 'bg-accent text-accent-ink',
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
