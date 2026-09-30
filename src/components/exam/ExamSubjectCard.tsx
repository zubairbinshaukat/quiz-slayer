import { useEffect, useState, type CSSProperties } from 'react'
import { formatTimeLeft, getBestScore, getUnlockStatus } from '../../lib/examState'
import { cn } from '../../lib/utils'
import { Pill } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import type { ExamState, ExamSubjectConfig } from '../../types'

interface ExamSubjectCardProps {
  config: ExamSubjectConfig
  examState: ExamState
  totalPoolSize: number
  onStart: (config: ExamSubjectConfig) => void
  index?: number
}

export function ExamSubjectCard({ config, examState, totalPoolSize, onStart, index = 0 }: ExamSubjectCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => getUnlockStatus(config.unlockUtc).secondsRemaining)
  const isUnlocked = secondsLeft === 0

  // Countdown tick (only while locked)
  useEffect(() => {
    if (isUnlocked) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isUnlocked])

  const { attempts, correctIds } = examState
  const mastered = correctIds.length
  const hasMastered = totalPoolSize > 0 && mastered >= totalPoolSize
  const hasAttempts = attempts.length > 0
  const best = getBestScore(attempts)
  const pct = totalPoolSize > 0 ? Math.min(100, (mastered / totalPoolSize) * 100) : 0
  const disabled = !isUnlocked || hasMastered

  const status = !isUnlocked
    ? { label: 'Locked', cls: 'bg-surface-2 text-muted' }
    : hasMastered
      ? { label: 'Mastered', cls: 'bg-success/12 text-success' }
      : hasAttempts
        ? { label: 'Retake', cls: 'bg-accent/15 text-accent-fg' }
        : { label: 'Available', cls: 'bg-info/12 text-info' }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onStart(config)}
      aria-label={disabled ? `${config.label}: ${status.label}` : `Start ${config.label} mock exam`}
      className={cn(
        'card press rise relative flex min-h-[208px] w-full flex-col p-4 text-left',
        disabled ? 'cursor-default' : 'hover:border-line-strong',
      )}
      style={{ '--i': index } as CSSProperties}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <Pill className={status.cls}>{status.label}</Pill>
        <Icon3D name={isUnlocked ? config.iconKey : 'lock'} size={68} className={cn('-mr-1 -mt-1', !isUnlocked && 'opacity-90')} />
      </div>

      <h3 className="mt-2 text-lg leading-snug">{config.label}</h3>
      <p className="mt-0.5 text-sm text-muted">{config.description}</p>

      <div className="mt-auto w-full pt-4">
        {isUnlocked ? (
          <>
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-muted">Mastery</span>
              <span className="font-mono text-muted">{mastered}/{totalPoolSize}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div className={cn('h-full rounded-full', hasMastered ? 'bg-success' : 'bg-accent')} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">
                {config.questionCount} MCQs
                {best !== null && (
                  <>
                    <span aria-hidden="true"> · </span>Best <span className="font-semibold text-fg">{best}%</span>
                  </>
                )}
              </span>
              {!hasMastered && (
                <span className="inline-flex items-center gap-1 font-semibold text-accent-fg">
                  {hasAttempts ? 'Retake' : 'Start'}
                  <Icon name="forward" size={16} />
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="clock" size={16} />
            Unlocks in <span className="font-mono font-semibold text-fg">{formatTimeLeft(secondsLeft)}</span>
          </p>
        )}
      </div>
    </button>
  )
}
