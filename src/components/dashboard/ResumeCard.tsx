import type { CSSProperties } from 'react'
import { getSubjectHue, getSubjectIcon } from '../../lib/subjectUtils'
import { Button, IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'

interface ContinueCardProps {
  slug: string
  subject: string
  /** 0-based question the user was on */
  current: number
  total: number
  answered: number
  onResume: () => void
  /** Hides the card (the saved quiz is kept and can still be resumed from its subject) */
  onDismiss: () => void
}

/** Shown only when a quiz was left unfinished: one tap back to the exact question. */
export function ContinueCard({ slug, subject, current, total, answered, onResume, onDismiss }: ContinueCardProps) {
  const progress = total > 0 ? answered / total : 0
  const cta = (
    <>
      Resume
      <Icon name="forward" size={18} strokeWidth={2.5} />
    </>
  )
  return (
    <section
      className="card tint-wide card-hover rise relative overflow-hidden p-5 sm:p-6"
      style={{ '--tint-h': getSubjectHue(slug), '--i': 1 } as CSSProperties}
      aria-label={`Continue: ${subject}`}
    >
      <IconButton label="Hide unfinished quiz" onClick={onDismiss} className="absolute right-1.5 top-1.5 z-10">
        <Icon name="close" size={18} />
      </IconButton>
      <div className="flex items-center gap-4 sm:gap-5">
        <Icon3D name={getSubjectIcon(slug)} size={80} eager shadow className="-my-2 shrink-0" />
        <div className="min-w-0 flex-1 pr-8 sm:pr-0">
          <p className="eyebrow">{`Continue · Q${current + 1} of ${total}`}</p>
          <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug sm:text-xl">{subject}</h2>
          <p className="mt-0.5 text-sm text-muted">{`${answered} answered · ${total - answered} to go`}</p>
        </div>
        <Button size="lg" className="mr-8 shrink-0 max-sm:hidden" onClick={onResume}>
          {cta}
        </Button>
      </div>
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
      <Button size="lg" className="mt-4 w-full sm:hidden" onClick={onResume}>
        {cta}
      </Button>
    </section>
  )
}
