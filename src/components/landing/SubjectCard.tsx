import type { CSSProperties } from 'react'
import { getSubjectHue, getSubjectIcon } from '../../lib/subjectUtils'
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

/** Tinted subject tile: mastery ring, overflowing 3D icon, name, meta, progress and a "to fix" chip. */
export function SubjectCard({
  subject, slug, questionCount, best, mastery, mistakes, index = 0, onStart, onPracticeMistakes, className,
}: SubjectCardProps) {
  const pct = Math.round(mastery * 100)
  return (
    <article
      className={cn('card tint lift-card rise relative flex min-h-[220px] flex-col p-5', className)}
      style={{ '--i': index, '--tint-h': getSubjectHue(slug) } as CSSProperties}
    >
      {/* Stretched primary action: the whole card starts the quiz */}
      <button
        type="button"
        onClick={onStart}
        className="absolute inset-0 z-0 rounded-card"
        aria-label={`Practice ${subject}, ${questionCount} questions`}
      />

      <Icon3D
        name={getSubjectIcon(slug)}
        size={104}
        shadow
        className="lift-icon pointer-events-none absolute -top-3 -right-2"
      />

      <ProgressRing value={mastery} size={44} stroke={3.5} gradient label={`${pct}% mastered`} className="pointer-events-none relative">
        <span className="font-mono text-[11px] font-bold">{pct}%</span>
      </ProgressRing>

      <div className="pointer-events-none relative mt-auto pt-6">
        <h3 className="font-display line-clamp-2 pr-2 text-lg font-extrabold leading-snug tracking-[-0.02em]">{subject}</h3>
        <p className="mt-1 text-sm text-muted">
          {questionCount} questions
          <span aria-hidden="true"> · </span>
          {best === null ? 'Not attempted' : <>Best <span className="font-semibold text-fg">{best}%</span></>}
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="relative mt-3 flex min-h-8 items-center justify-between gap-2">
        {mistakes > 0 && onPracticeMistakes ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPracticeMistakes()
            }}
            className="lift-chip press relative z-10 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-danger/30 bg-danger/12 px-3 text-xs font-bold text-danger hover:bg-danger/20"
            aria-label={`Retry ${mistakes} mistake${mistakes === 1 ? '' : 's'} in ${subject}`}
          >
            <Icon name="refresh" size={13} strokeWidth={2.5} />
            {mistakes} to fix
          </button>
        ) : (
          <span />
        )}
        <span
          aria-hidden="true"
          className="lift-cta pointer-events-none inline-flex min-h-8 items-center gap-1 rounded-full bg-accent px-3 text-xs font-bold text-accent-ink"
        >
          Start <Icon name="forward" size={13} strokeWidth={3} />
        </span>
      </div>
    </article>
  )
}
