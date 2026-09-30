import type { ReactNode } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { getGrade, TONE_SOFT, TONE_TEXT } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Icon3D } from '../ui/Icon3D'

interface ScoreHeroProps {
  score: number
  subject: string
  eyebrow?: ReactNode
  /** Override the grade label (e.g. "Cleared!") */
  headline?: string
}

/** Giant counted-up score with grade badge and a 3D grade icon. */
export function ScoreHero({ score, subject, eyebrow, headline }: ScoreHeroProps) {
  const grade = getGrade(score)
  const value = useCountUp(score, 1.1)
  return (
    <section className="card relative overflow-hidden px-5 pt-5 pb-6 text-center animate-pop" aria-label={`Score ${score} percent, ${grade.label}`}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-muted">{eyebrow}</p>}
      <p className="mt-1 truncate text-sm font-semibold text-muted">{subject}</p>
      <Icon3D name={grade.icon} size={96} eager className="mx-auto mt-3" />
      <p className={cn('mt-2 text-[64px] font-extrabold leading-none tracking-[-0.04em] sm:text-[72px]', TONE_TEXT[grade.tone])} aria-hidden="true">
        {value}
        <span className="text-[0.5em] align-top">%</span>
      </p>
      <span className={cn('mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold', TONE_SOFT[grade.tone])}>
        {headline ?? grade.label}
      </span>
    </section>
  )
}
