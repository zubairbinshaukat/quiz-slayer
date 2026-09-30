import { formatPoints } from '../../lib/ranking'
import { cn } from '../../lib/utils'
import { Icon3D } from '../ui/Icon3D'
import { Avatar } from './Avatar'
import type { Row } from '../../hooks/leaderboardTypes'

const SLOTS = [
  { rank: 2, height: 'h-20', order: 'order-1' },
  { rank: 1, height: 'h-28', order: 'order-2' },
  { rank: 3, height: 'h-14', order: 'order-3' },
] as const

/** Top three: #1 centred and tallest. Empty places render as open spots. */
export function Podium({ rows, meId }: { rows: Row[]; meId?: string }) {
  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-3" aria-label="Top three">
      {SLOTS.map(({ rank, height, order }) => {
        const row = rows.find((r) => r.rank === rank)
        const first = rank === 1
        return (
          <li key={rank} className={cn('flex min-w-0 flex-col items-center', order)} aria-label={row ? `Rank ${rank}: ${row.name}, ${formatPoints(row.points)} points` : `Rank ${rank}: open`}>
            <Icon3D name={first ? 'trophy' : 'medal'} size={first ? 64 : 48} eager className={cn(!row && 'opacity-40 grayscale')} />
            <div className="mt-2 flex w-full min-w-0 flex-col items-center px-1 text-center">
              {row ? (
                <>
                  <Avatar name={row.name} size={first ? 48 : 40} className={cn(first && 'ring-2 ring-accent ring-offset-2 ring-offset-bg')} />
                  <p className="mt-1.5 w-full truncate text-sm font-semibold">
                    {row.name}
                    {row.deviceId === meId && <span className="text-muted"> (you)</span>}
                  </p>
                  <p className={cn('font-mono text-sm font-bold', first ? 'text-accent-fg' : 'text-muted')}>{formatPoints(row.points)} pts</p>
                </>
              ) : (
                <>
                  <span className="size-10 rounded-full border border-dashed border-line-strong" aria-hidden="true" />
                  <p className="mt-1.5 text-sm text-muted">Open spot</p>
                  <p className="font-mono text-sm text-muted">—</p>
                </>
              )}
            </div>
            <div
              className={cn(
                'mt-2 flex w-full items-start justify-center rounded-t-[14px] pt-2 text-2xl font-extrabold',
                height,
                first ? 'bg-accent text-accent-ink' : 'border border-b-0 border-line bg-surface text-muted',
              )}
              aria-hidden="true"
            >
              {rank}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
