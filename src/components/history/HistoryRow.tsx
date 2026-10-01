import { useId, useState, type CSSProperties } from 'react'
import { resultTone } from '../../lib/constants'
import { getSubjectHue } from '../../lib/subjectUtils'
import { cn, formatClock, formatTimeOfDay } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Pill } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import { ProgressRing } from '../ui/ProgressRing'
import type { HistoryEntry } from '../../types'

interface HistoryRowProps {
  entry: HistoryEntry
  index: number
  onDelete: (id: number) => void
}

const RING_TONE = { success: 'text-success', accent: 'text-accent', danger: 'text-danger' } as const

/** Tint dot · subject · mode · score ring · time · chevron. Expands for details and delete. */
export function HistoryRow({ entry, index, onDelete }: HistoryRowProps) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const wrong = Math.max(0, entry.total - entry.correct)
  return (
    <li className="card card-hover rise cv-row overflow-hidden" style={{ '--i': Math.min(index, 8) } as CSSProperties}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={detailsId}
        className="press flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-2"
      >
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: `hsl(${getSubjectHue(entry.slug)} 80% 62%)`, boxShadow: `0 0 0 4px hsl(${getSubjectHue(entry.slug)} 80% 62% / 0.15)` }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{entry.subject}</span>
          <span className="mt-1 flex items-center gap-2 overflow-hidden whitespace-nowrap font-mono text-xs text-muted">
            {formatTimeOfDay(entry.dateTaken)} · {entry.correct}/{entry.total}
            {entry.mode === 'exam' && <Pill className="bg-info/12 py-0 font-sans text-info">Exam</Pill>}
            {entry.mode === 'retry' && <Pill className="bg-danger/12 py-0 font-sans text-danger">Retry</Pill>}
            {(entry.mode ?? 'quiz') === 'quiz' && <Pill className="border border-line py-0 font-sans text-muted">Practice</Pill>}
          </span>
        </span>
        <ProgressRing value={entry.score / 100} size={28} stroke={3} tone={RING_TONE[resultTone(entry.score)]} label={`Score ${entry.score}%`} />
        <span className="w-10 shrink-0 text-right font-mono text-sm font-bold max-sm:-ml-1">{entry.score}%</span>
        <Icon name="chevronDown" size={18} className={cn('shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div id={detailsId} className="animate-fade-in border-t border-line px-4 py-3">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Correct', entry.correct, 'text-success'],
              ['Wrong', wrong, wrong > 0 ? 'text-danger' : ''],
              ['Time', formatClock(entry.timeTaken), ''],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-btn bg-surface-2 px-2 py-2">
                <dt className="eyebrow">{label}</dt>
                <dd className={cn('mt-0.5 font-mono text-base font-bold', tone)}>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex justify-end">
            <Button variant="danger" size="sm" onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.subject} attempt`}>
              <Icon name="trash" size={16} />
              Delete attempt
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
