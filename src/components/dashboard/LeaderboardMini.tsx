import { Link } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { ROUTES } from '../../lib/constants'
import { formatPoints, MIN_ANSWERED_FOR_BOARD } from '../../lib/ranking'
import { cn } from '../../lib/utils'
import { Avatar } from '../leaderboard/Avatar'
import { Icon } from '../ui/Icon'
import type { UseLeaderboardResult } from '../../hooks/leaderboardTypes'

const MEDAL = ['var(--color-accent)', 'var(--color-silver)', 'var(--color-bronze)']

/** Rail card: top three, your rank, link to the full board. */
export function LeaderboardMini({ board }: { board: UseLeaderboardResult }) {
  const { lite } = useLiteMode()
  const { loading, unavailable, top, me } = board
  const podium = top.slice(0, 3)

  return (
    <section className="card p-5" aria-labelledby="lb-mini-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="lb-mini-heading" className="text-lg font-bold tracking-[-0.01em]">Leaderboard</h2>
        <Link
          to={ROUTES.LEADERBOARD}
          viewTransition={!lite}
          className="press -mr-2 inline-flex min-h-9 items-center gap-1 rounded-btn px-2 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg"
        >
          See all <Icon name="forward" size={14} strokeWidth={2.5} />
        </Link>
      </div>

      {unavailable ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Icon name="wifiOff" size={16} className="shrink-0" /> Leaderboard needs a connection
        </p>
      ) : loading ? (
        <ul className="mt-3 space-y-2" aria-busy="true" aria-label="Loading leaderboard">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-12 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </ul>
      ) : podium.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nobody's ranked yet. Answer {MIN_ANSWERED_FOR_BOARD} questions to claim #1.</p>
      ) : (
        <ol className="mt-3 space-y-1.5" aria-label="Top three">
          {podium.map((row, i) => (
            <li
              key={row.id}
              className={cn(
                'flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-1.5',
                row.id === me?.id ? 'bg-accent/8 ring-1 ring-accent/40' : 'bg-surface-2',
              )}
            >
              <span className="w-4 text-center font-mono text-sm font-bold" style={{ color: MEDAL[i] }}>{row.rank}</span>
              <Avatar name={row.name} size={30} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.name}</span>
              <span className="font-mono text-sm font-bold">{formatPoints(row.points)}</span>
            </li>
          ))}
        </ol>
      )}

      {!unavailable && !loading && (
        <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
          {me?.qualified && me.rank !== null ? (
            <>
              You're <span className="font-mono font-bold text-fg">#{me.rank}</span> with{' '}
              <span className="font-mono font-bold text-fg">{formatPoints(me.points)}</span> pts
            </>
          ) : (
            <>Answer {Math.max(0, MIN_ANSWERED_FOR_BOARD - (me?.answered ?? 0))} more questions to get ranked</>
          )}
        </p>
      )}
    </section>
  )
}
