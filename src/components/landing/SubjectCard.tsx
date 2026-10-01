import type { CSSProperties } from 'react'
import { getSubjectIcon } from '../../lib/subjectUtils'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import { ProgressRing } from '../ui/ProgressRing'

export interface SubjectCardProps {
  subject: string
  slug: string
  questionCount: number
  /** Best score % (null = never attempted) */
  best: number | null
  /** 0–1 share of questions mastered */
  mastery: number
  mistakes: number
  index?: number
  onStart: () => void
  onPracticeMistakes?: () => void
  className?: string
}

export function SubjectCard({
  subject, slug, questionCount, best, mastery, mistakes, index = 0, onStart, onPracticeMistakes, className,
}: SubjectCardProps) {
  const pct = Math.round(mastery * 100)
  return (
    <article
      className={cn('card press rise relative flex min-h-[232px] flex-col p-4 hover:border-line-strong', className)}
      style={{ '--i': index } as CSSProperties}
    >
      {/* Stretched primary action: the whole card starts the quiz */}
      <button
        type="button"
        onClick={onStart}
        className="absolute inset-0 z-0 rounded-card"
        aria-label={`Practice ${subject}, ${questionCount} questions`}
      />

      <div className="pointer-events-none relative flex items-start justify-between">
        <ProgressRing value={mastery} size={46} stroke={3} label={`${pct}% mastered`}>
          <span className="text-[11px] font-bold">{pct}%</span>
        </ProgressRing>
        <Icon3D name={getSubjectIcon(slug)} size={76} className="-mr-1.5 -mt-1.5" />
      </div>

      <div className="pointer-events-none relative mt-auto pt-4">
        <h3 className="line-clamp-2 text-lg leading-snug">{subject}</h3>
        <p className="mt-1 text-sm text-muted">
          {questionCount} questions
          <span aria-hidden="true"> · </span>
          {best === null ? 'Not attempted' : <>Best <span className="font-semibold text-fg">{best}%</span></>}
        </p>
      </div>

      {mistakes > 0 && onPracticeMistakes && (
        <button
          type="button"
          onClick={onPracticeMistakes}
          className="press relative z-10 mt-3 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-btn border border-line bg-surface-2 px-3 text-sm font-semibold hover:border-danger/40"
        >
          <Icon name="refresh" size={16} className="text-danger" />
          Practice mistakes ({mistakes})
        </button>
      )}
    </article>
  )
}
