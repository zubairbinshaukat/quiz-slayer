import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import type { QuestionStatus } from './QuizProgress'

interface QuestionPaletteProps {
  statuses: QuestionStatus[]
  current: number
  onJump: (index: number) => void
  /** 'strip' = horizontal scroller (mobile); 'grid' = 6 per row (desktop rail). */
  layout?: 'strip' | 'grid'
  className?: string
}

function chipClass(s: QuestionStatus, isCurrent: boolean): string {
  return cn(
    'press flex items-center justify-center rounded-btn border font-mono text-sm font-semibold',
    s === 'correct' && 'border-success/40 bg-success/12 text-success',
    s === 'wrong' && 'border-danger/40 bg-danger/12 text-danger',
    s === 'answered' && 'border-line-strong bg-surface-3 text-fg',
    s === 'open' && 'border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg',
    isCurrent && 'border-accent ring-2 ring-accent/35',
    isCurrent && s === 'open' && 'bg-accent text-accent-ink hover:text-accent-ink',
  )
}

/** Numbered jump chips coloured by result; keeps the current chip in view. */
export function QuestionPalette({ statuses, current, onJump, layout = 'strip', className }: QuestionPaletteProps) {
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (layout !== 'strip') return
    const strip = stripRef.current
    const chip = strip?.querySelector<HTMLElement>(`[data-index="${current}"]`)
    if (!strip || !chip) return
    const left = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2
    strip.scrollTo({ left, behavior: 'smooth' })
  }, [current, layout])

  const chips = statuses.map((s, i) => {
    const isCurrent = i === current
    return (
      <button
        key={i}
        type="button"
        data-index={i}
        onClick={() => onJump(i)}
        aria-current={isCurrent ? 'step' : undefined}
        aria-label={`Question ${i + 1}, ${s === 'open' ? 'unanswered' : s}`}
        className={cn(chipClass(s, isCurrent), layout === 'strip' ? 'size-11 shrink-0' : 'h-10 w-full min-w-0 text-[13px]')}
      >
        {i + 1}
      </button>
    )
  })

  if (layout === 'grid') {
    return (
      <nav aria-label="Question palette" className={cn('card p-4', className)}>
        <p className="eyebrow mb-3">Questions</p>
        <div className="grid max-h-[46vh] grid-cols-6 gap-1.5 overflow-x-hidden overflow-y-auto p-1" data-lenis-prevent>
          {chips}
        </div>
      </nav>
    )
  }

  return (
    <nav aria-label="Question palette" className={cn('mt-6', className)}>
      <p className="eyebrow mb-2">Jump to</p>
      <div ref={stripRef} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1" data-lenis-prevent>
        {chips}
      </div>
    </nav>
  )
}
