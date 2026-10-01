import { useEffect, useState } from 'react'
import { useLenis } from '../../lib/lenis'
import { MIN_ANSWERED_FOR_BOARD } from '../../lib/ranking'
import { cn } from '../../lib/utils'
import { Avatar } from './Avatar'
import { LeaderRow } from './LeaderRow'
import type { MeRow, PlayerInfo } from '../../hooks/leaderboardTypes'

/** Fixed above the tab bar on mobile (offset from --tabbar-height), sticky at the rows column's foot from md up. */
const POSITION =
  'fixed inset-x-4 bottom-[calc(var(--tabbar-height)+12px+env(safe-area-inset-bottom))] z-30 md:sticky md:inset-x-auto md:bottom-6 md:mt-4'

/**
 * "You" bar. Shown only while your own row (podium or list, marked data-me-row) is off-screen;
 * slides in/out (instant in lite mode). Tapping it scrolls to your row.
 */
export function MeBar({ me, player }: { me: MeRow | null; player: PlayerInfo | null }) {
  const name = me?.name ?? player?.name ?? 'You'
  const lenis = useLenis()
  const [rowVisible, setRowVisible] = useState(false)
  const ranked = !!me?.qualified && me.rank !== null

  useEffect(() => {
    const row = document.querySelector<HTMLElement>('[data-me-row]')
    if (!ranked || !row) return
    const io = new IntersectionObserver(([entry]) => setRowVisible(entry.isIntersecting), { threshold: 0.6 })
    io.observe(row)
    return () => {
      io.disconnect()
      setRowVisible(false)
    }
  }, [ranked, me?.rank])

  function scrollToRow() {
    const row = document.querySelector<HTMLElement>('[data-me-row]')
    if (!row) return
    if (lenis) lenis.scrollTo(row, { offset: -window.innerHeight / 3 })
    else row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const shown = !ranked || !rowVisible
  const motion = cn(
    'transition-[transform,opacity] duration-[220ms] ease-out',
    shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
  )
  const surface = 'rounded-card border border-accent/60 bg-surface shadow-[var(--hl),var(--float)] dark:bg-surface-2'

  if (ranked && me) {
    return (
      <div className={cn(POSITION, motion)} inert={!shown} aria-hidden={!shown}>
        <button type="button" onClick={scrollToRow} className={cn('block w-full text-left', surface)} aria-label={`Your position: rank ${me.rank}. Show my row`}>
          <LeaderRow
            as="div"
            rank={`#${me.rank}`}
            name={name}
            points={me.points}
            correct={me.correct}
            answered={me.answered}
            accuracy={me.accuracy}
            highlight
            className="border-0 bg-transparent shadow-none hover:bg-transparent"
          />
        </button>
      </div>
    )
  }

  const answered = me?.answered ?? 0
  const pct = Math.min(100, (answered / MIN_ANSWERED_FOR_BOARD) * 100)
  return (
    <div className={cn(POSITION, surface, 'flex items-center gap-3 px-3.5 py-3')}>
      <Avatar name={name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name} <span className="text-muted">(you)</span></p>
        <p className="text-sm text-muted">Answer {MIN_ANSWERED_FOR_BOARD} questions to rank</p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={MIN_ANSWERED_FOR_BOARD} aria-valuenow={answered} aria-label="Progress to ranking">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="shrink-0 font-mono text-sm font-bold">{answered}/{MIN_ANSWERED_FOR_BOARD}</span>
    </div>
  )
}
