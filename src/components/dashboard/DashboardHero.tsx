import type { ReactNode } from 'react'
import type { WeekDay } from '../../lib/streak'
import { StreakDots } from './StreakDots'

interface DashboardHeroProps {
  /** Chosen leaderboard name, if any */
  name: string | null
  subline: ReactNode
  streak: number
  week: WeekDay[]
}

/** Eyebrow, display heading and progress line. Below 1024px the week's streak dots sit under it. */
export function DashboardHero({ name, subline, streak, week }: DashboardHeroProps) {
  return (
    <header className="rise">
      <p className="eyebrow">Quiz Slayer</p>
      <h1 className="mt-2 text-[40px] font-extrabold leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
        {name ? (
          <>
            Welcome back,
            <br className="sm:hidden" /> <span className="text-fg">{name}</span>
          </>
        ) : (
          'Ready to slay?'
        )}
      </h1>
      <p className="mt-3 max-w-[52ch] text-[15px] text-muted lg:text-base">{subline}</p>
      <div className="card mt-5 px-4 pt-3.5 pb-3 lg:hidden">
        <StreakDots week={week} streak={streak} />
      </div>
    </header>
  )
}
