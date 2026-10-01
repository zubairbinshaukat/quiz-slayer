import type { CSSProperties } from 'react'
import { getSubjectHue, getSubjectIcon } from '../../lib/subjectUtils'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'

interface ShellProps {
  slug: string
  eyebrow: string
  title: string
  meta: string
  /** 0–1; omit to hide the bar */
  progress?: number
  cta: string
  onAction: () => void
}

function WideCard({ slug, eyebrow, title, meta, progress, cta, onAction }: ShellProps) {
  return (
    <section
      className="card tint-wide card-hover rise relative overflow-hidden p-5 sm:p-6"
      style={{ '--tint-h': getSubjectHue(slug), '--i': 1 } as CSSProperties}
      aria-label={`${eyebrow}: ${title}`}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <Icon3D name={getSubjectIcon(slug)} size={80} eager shadow className="-my-2 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug sm:text-xl">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{meta}</p>
        </div>
        <Button size="lg" className="shrink-0 max-sm:hidden" onClick={onAction}>
          {cta}
          <Icon name="forward" size={18} strokeWidth={2.5} />
        </Button>
      </div>
      {progress !== undefined && (
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Quiz progress"
        >
          <div className="h-full rounded-full bg-linear-to-r from-accent to-accent-hover" style={{ width: `${Math.max(3, progress * 100)}%` }} />
        </div>
      )}
      <Button size="lg" className="mt-4 w-full sm:hidden" onClick={onAction}>
        {cta}
        <Icon name="forward" size={18} strokeWidth={2.5} />
      </Button>
    </section>
  )
}

interface ContinueCardProps {
  slug: string
  subject: string
  /** 0-based question the user was on */
  current: number
  total: number
  answered: number
  onResume: () => void
}

/** Shown when a quiz is saved mid-way: one tap back to the exact question. */
export function ContinueCard({ slug, subject, current, total, answered, onResume }: ContinueCardProps) {
  return (
    <WideCard
      slug={slug}
      eyebrow={`Continue · Question ${current + 1} of ${total}`}
      title={subject}
      meta={`${answered} answered · ${total - answered} to go`}
      progress={total > 0 ? answered / total : 0}
      cta="Resume"
      onAction={onResume}
    />
  )
}

interface QuickStartCardProps {
  slug: string
  subject: string
  count: number
  onStart: () => void
}

/** No saved quiz: a one-tap quick round with the first subject. */
export function QuickStartCard({ slug, subject, count, onStart }: QuickStartCardProps) {
  return (
    <WideCard
      slug={slug}
      eyebrow="Quick start"
      title={`Start a quick ${count}`}
      meta={`${subject} · practice mode, instant feedback`}
      cta="Play"
      onAction={onStart}
    />
  )
}
