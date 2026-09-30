import { MIN_ANSWERED_FOR_BOARD } from '../../lib/ranking'
import { LeaderRow } from './LeaderRow'
import { Avatar } from './Avatar'
import type { MeRow, PlayerInfo } from '../../hooks/leaderboardTypes'

/** "You" row pinned above the tab bar. */
export function MeBar({ me, player }: { me: MeRow | null; player: PlayerInfo | null }) {
  const name = me?.name ?? player?.name ?? 'You'

  if (me?.qualified && me.rank !== null) {
    return (
      <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 mt-4 md:bottom-4">
        <p className="sr-only">Your position</p>
        <LeaderRow
          as="div"
          rank={`#${me.rank}`}
          name={`${name} (you)`}
          points={me.points}
          correct={me.correct}
          answered={me.answered}
          accuracy={me.accuracy}
          highlight
          className="bg-surface-2"
        />
      </div>
    )
  }

  const answered = me?.answered ?? 0
  const pct = Math.min(100, (answered / MIN_ANSWERED_FOR_BOARD) * 100)
  return (
    <div className="card sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 mt-4 flex items-center gap-3 border-accent/40 bg-surface-2 px-3 py-3 md:bottom-4">
      <Avatar name={name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name} <span className="text-muted">(you)</span></p>
        <p className="text-sm text-muted">Answer {MIN_ANSWERED_FOR_BOARD} questions to rank</p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg" role="progressbar" aria-valuemin={0} aria-valuemax={MIN_ANSWERED_FOR_BOARD} aria-valuenow={answered} aria-label="Progress to ranking">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="shrink-0 font-mono text-sm font-bold">{answered}/{MIN_ANSWERED_FOR_BOARD}</span>
    </div>
  )
}
