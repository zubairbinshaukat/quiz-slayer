import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isLiteActive } from '../../lib/liteMode'
import { replayPodium } from '../../lib/podium'
import { formatPoints } from '../../lib/ranking'
import { cn } from '../../lib/utils'
import { prefersReducedMotion } from '../../lib/viewTransition'
import { Confetti } from '../ui/Confetti'
import { Avatar } from './Avatar'
import type { Row } from '../../hooks/leaderboardTypes'

/** Display order 2 · 1 · 3; heights per spec §7; delays: 3rd 0.1s, 2nd 0.35s, 1st 0.6s. */
const SLOTS = [
  { rank: 2, height: 120, avatar: 56, color: 'var(--color-silver)', delay: 0.35 },
  { rank: 1, height: 160, avatar: 64, color: 'var(--color-accent)', delay: 0.6 },
  { rank: 3, height: 100, avatar: 56, color: 'var(--color-bronze)', delay: 0.1 },
] as const

const CONFETTI_AT_MS = 1350

function Crown() {
  return (
    <svg viewBox="0 0 32 22" width="34" height="23" aria-hidden="true" className="podium-crown mb-1 drop-shadow-[0_4px_10px_rgb(245_183_58/0.45)]">
      <path d="M2 7l7 6 7-11 7 11 7-6-3 14H5z" fill="#F5B73A" stroke="#FFD27A" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="2" cy="6" r="2" fill="#FFD27A" />
      <circle cx="16" cy="2" r="2" fill="#FFD27A" />
      <circle cx="30" cy="6" r="2" fill="#FFD27A" />
    </svg>
  )
}

export function Coin({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7" fill="#E9A92A" />
      <circle cx="8" cy="8" r="5" fill="#F5B73A" stroke="#FFD27A" strokeWidth="1" />
      <path d="M8 5.2v5.6" stroke="#9A6408" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Top three on 3D blocks with a staged entrance (blocks spring up, avatars drop, names fade, confetti). */
export function Podium({ rows, meId }: { rows: Row[]; meId?: string }) {
  const listRef = useRef<HTMLOListElement>(null)
  const [celebrate, setCelebrate] = useState(false)
  const hasWinner = rows.some((r) => r.rank === 1)

  useEffect(() => {
    replayPodium(listRef.current)
    if (!hasWinner || isLiteActive() || prefersReducedMotion()) return
    const t = window.setTimeout(() => setCelebrate(true), CONFETTI_AT_MS)
    return () => window.clearTimeout(t)
  }, [hasWinner])

  return (
    <>
      {celebrate && <Confetti count={48} />}
      <ol ref={listRef} className="podium grid grid-cols-3 items-end gap-2.5 pt-2 sm:gap-4" aria-label="Top three">
        {SLOTS.map(({ rank, height, avatar, color, delay }) => {
          const row = rows.find((r) => r.rank === rank)
          const first = rank === 1
          return (
            <li
              key={rank}
              data-me-row={(row && row.id === meId) || undefined}
              className="flex min-w-0 flex-col items-center"
              style={{ '--d': `${delay}s` } as CSSProperties}
              aria-label={row ? `Rank ${rank}: ${row.name}, ${formatPoints(row.points)} points` : `Rank ${rank}: open`}
            >
              <div className="podium-avatar flex flex-col items-center">
                {first && <Crown />}
                {row ? (
                  <Avatar name={row.name} size={avatar} ring={color} />
                ) : (
                  <span className="rounded-full border-2 border-dashed border-line-strong bg-surface-2" style={{ width: avatar, height: avatar }} aria-hidden="true" />
                )}
              </div>
              <div className="podium-meta flex w-full flex-col items-center">
                <p className="font-display mt-3 w-full truncate px-1 text-center text-[15px] font-bold">
                  {row ? row.name : <span className="font-semibold text-muted">Open spot</span>}
                  {row && row.id === meId && <span className="font-semibold text-muted"> (you)</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-mono text-sm font-bold text-muted">
                  {row ? (
                    <>
                      <Coin />
                      <span className={first ? 'text-fg' : undefined}>{formatPoints(row.points)}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>

              <div
                aria-hidden="true"
                className={cn('podium-block relative mt-5 w-full', first && 'podium-first')}
                style={{ height, '--block': color } as CSSProperties}
              >
                {first && <span className="podium-shine" />}
                <span className="podium-num relative">{rank}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}
