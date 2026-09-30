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
  className?: string
}

export function LeaderRow({ rank, name, points, correct, answered, accuracy, highlight, index = 0, as: Tag = 'li', className }: LeaderRowProps) {
  return (
    <Tag
      className={cn('card rise flex min-h-16 items-center gap-3 px-3 py-2.5', highlight && 'border-accent/50', className)}
      style={{ '--i': Math.min(index, 10) } as CSSProperties}
    >
      <span className="w-8 shrink-0 text-center font-mono text-sm font-bold text-muted">{rank}</span>
      <Avatar name={name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name}</p>
        <span className="mt-0.5 inline-flex rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
          {correct}/{answered} · {Math.round(accuracy)}%
        </span>
      </div>
      <span className="shrink-0 text-right">
        <span className="block font-mono text-base font-bold">{formatPoints(points)}</span>
        <span className="block text-[11px] text-muted">pts</span>
      </span>
    </Tag>
  )
}
