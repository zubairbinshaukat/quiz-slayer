import type { ReactNode } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { getGrade, RESULT_HEX, resultTone, TONE_SOFT, TONE_TEXT } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Icon3D } from '../ui/Icon3D'

interface ScoreHeroProps {
  score: number
  subject: string
  eyebrow?: ReactNode
  /** Override the grade label (e.g. "Cleared!", "Passed") */
  headline?: string
  /** Extra line under the badge */
  children?: ReactNode
}

/** Full-width result card: grade-coloured glow, 3D grade icon, counted-up score and badge. */
export function ScoreHero({ score, subject, eyebrow, headline, children }: ScoreHeroProps) {
  const grade = getGrade(score)
  const tone = resultTone(score)
  const value = useCountUp(score, 1.1)
  return (
    <section
      className="card relative overflow-hidden px-5 pt-6 pb-7 animate-pop sm:px-8 lg:py-9"
      aria-label={`Score ${score} percent, ${headline ?? grade.label}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(520px 340px at 50% 0%, ${RESULT_HEX[tone]}33, transparent 70%)` }}
      />
      <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <Icon3D name={grade.icon} size={140} eager shadow className="shrink-0" />
        <div className="mt-2 min-w-0 sm:mt-0">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <p className="mt-1 truncate text-sm font-semibold text-muted">{subject}</p>
          <p
            className={cn('font-display mt-1 text-[88px] font-extrabold leading-[0.95] tracking-[-0.05em] tabular-nums sm:text-[96px]', TONE_TEXT[tone])}
            aria-hidden="true"
          >
            {value}
            <span className="align-top text-[0.45em] tracking-normal">%</span>
          </p>
          <span className={cn('mt-3 inline-flex rounded-full px-3.5 py-1.5 text-sm font-bold', TONE_SOFT[tone])}>
            {headline ?? grade.label}
          </span>
          {children}
        </div>
      </div>
    </section>
  )
}
