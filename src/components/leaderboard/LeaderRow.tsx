import type { CSSProperties, ReactNode } from 'react'
import { formatPoints } from '../../lib/ranking'
import { cn } from '../../lib/utils'
import { Avatar } from './Avatar'

interface LeaderRowProps {
  rank: ReactNode
  name: string
  points: number
  correct: number
  answered: number
  accuracy: number
  highlight?: boolean
  index?: number
  as?: 'li' | 'div'
  /** Marks the signed-in player's row in the list (MeBar watches it) */
  meRow?: boolean
  className?: string
}

/** Rank · avatar · name with "45 / 70 · 64%" · points. Your row: amber border + faint amber fill. */
export function LeaderRow({ rank, name, points, correct, answered, accuracy, highlight, index = 0, as: Tag = 'li', meRow, className }: LeaderRowProps) {
  return (
    <Tag
      data-me-row={meRow || undefined}
      className={cn(
        'card rise flex min-h-16 items-center gap-3 px-3.5 py-2.5 transition-colors duration-150 hover:bg-surface-3',
        highlight && 'border-accent/60 bg-accent/6',
        className,
      )}
      style={{ '--i': Math.min(index, 10) } as CSSProperties}
    >
      <span className="w-8 shrink-0 text-center font-mono text-sm font-bold text-muted">{rank}</span>
      <Avatar name={name} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name}{highlight && <span className="font-medium text-muted"> (you)</span>}</p>
        <p className="mt-0.5 font-mono text-xs text-muted">
          {correct} / {answered} · {Math.round(accuracy)}%
        </p>
      </div>
      <span className="shrink-0 text-right">
        <span className="block font-mono text-base font-bold">{formatPoints(points)}</span>
        <span className="block text-[11px] text-muted">pts</span>
      </span>
    </Tag>
  )
}
