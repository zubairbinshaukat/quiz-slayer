import type { WeekDay } from '../../lib/streak'
import { formatXp, useXp } from '../../lib/xp'
import { Icon3D } from '../ui/Icon3D'
import { StreakDots } from './StreakDots'

interface StreakCardProps {
  streak: number
  best: number
  week: WeekDay[]
}

/** Rail card: fire, "{n} day streak", this week's dots and the best run. */
export function StreakCard({ streak, best, week }: StreakCardProps) {
  const xp = useXp()
  return (
    <section className="card relative overflow-hidden p-5" aria-labelledby="streak-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_150px_at_0%_0%,rgb(255_120_40/0.16),transparent_70%)]"
      />
      <div className="relative flex items-center gap-3">
        <Icon3D name="fire" size={52} eager shadow />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Streak</p>
          <h2 id="streak-heading" className="text-xl font-extrabold tracking-[-0.02em]">
            <span className="font-mono">{streak}</span> day{streak === 1 ? '' : 's'} streak
          </h2>
        </div>
        <span className="flex flex-col items-end gap-1">
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
            Best <span className="font-mono text-fg">{best}</span>
          </span>
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs font-semibold text-fg">{formatXp(xp)}</span>
        </span>
      </div>
      <StreakDots week={week} streak={streak} showCount={false} className="relative mt-5" />
      <p className="relative mt-4 text-[13px] text-muted">
        {week.some((d) => d.today && d.studied)
          ? 'Done for today. See you tomorrow.'
          : streak > 0
            ? 'Finish one quiz today to keep it alive.'
            : 'Finish a quiz today to start a streak.'}
      </p>
    </section>
  )
}
