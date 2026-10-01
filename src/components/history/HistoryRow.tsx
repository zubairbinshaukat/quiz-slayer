import type { CSSProperties } from 'react'
import { getGrade, TONE_SOFT } from '../../lib/constants'
import { cn, formatClock, formatTimeOfDay } from '../../lib/utils'
import { IconButton } from '../ui/Button'
import { Pill } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import type { HistoryEntry } from '../../types'

interface HistoryRowProps {
  entry: HistoryEntry
  index: number
  onDelete: (id: number) => void
}

export function HistoryRow({ entry, index, onDelete }: HistoryRowProps) {
  const grade = getGrade(entry.score)
  return (
    <li className="card rise cv-row flex items-center gap-3 py-2 pr-1.5 pl-4" style={{ '--i': Math.min(index, 8) } as CSSProperties}>
      <div className="min-w-0 flex-1 py-1">
        <p className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[15px] font-semibold">{entry.subject}</span>
          {entry.mode === 'exam' && <Pill className="shrink-0 bg-info/12 text-info">Exam</Pill>}
          {entry.mode === 'retry' && <Pill className="shrink-0 bg-danger/12 text-danger">Retry</Pill>}
        </p>
        <p className="mt-0.5 font-mono text-xs text-muted">
          {entry.correct}/{entry.total} · {formatClock(entry.timeTaken)} · {formatTimeOfDay(entry.dateTaken)}
        </p>
      </div>
      <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-sm font-bold', TONE_SOFT[grade.tone])}>{entry.score}%</span>
      <IconButton label={`Delete ${entry.subject} attempt`} onClick={() => onDelete(entry.id)} className="hover:text-danger">
        <Icon name="trash" size={18} />
      </IconButton>
    </li>
  )
}
