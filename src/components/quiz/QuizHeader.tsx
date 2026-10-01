import { Link } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { useSound } from '../../hooks/useSound'
import { Pill } from '../ui/Chip'
import { IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { ElapsedTimer } from './ElapsedTimer'
import { ExamCountdown } from './ExamCountdown'
import { SegmentedProgress, type QuestionStatus } from './SegmentedProgress'
import type { QuizMode } from '../../types'

interface QuizHeaderProps {
  subject: string
  mode: QuizMode
  exitTo: string
  current: number
  statuses: QuestionStatus[]
  startTime: Date | null
  /** Timed exam: epoch ms deadline (shows a countdown instead of the stopwatch) */
  deadline?: number | null
  onExpire?: () => void
  onHelp: () => void
}

export function QuizHeader({ subject, mode, exitTo, current, statuses, startTime, deadline, onExpire, onHelp }: QuizHeaderProps) {
  const { soundEnabled, toggleSound } = useSound()
  const { lite } = useLiteMode()
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-line bg-bg">
      <div className="mx-auto max-w-[640px] px-2 pb-3 sm:px-4">
        <div className="flex h-14 items-center gap-1">
          <Link
            to={exitTo}
            viewTransition={!lite}
            aria-label="Exit quiz (progress is saved)"
            title="Exit (progress is saved)"
            className="press inline-flex size-11 shrink-0 items-center justify-center rounded-btn text-muted hover:bg-surface-2 hover:text-fg"
          >
            <Icon name="back" size={22} />
          </Link>
          <div className="min-w-0 flex-1 px-1">
            <p className="flex items-center gap-2 truncate text-sm font-semibold">
              <span className="truncate">{subject}</span>
              {mode !== 'quiz' && (
                <Pill className={mode === 'exam' ? 'bg-info/12 text-info' : 'bg-danger/12 text-danger'}>
                  {mode === 'exam' ? 'Exam' : 'Retry'}
                </Pill>
              )}
            </p>
            <p className="font-mono text-xs text-muted">
              Question {current + 1}/{statuses.length}
            </p>
          </div>
          {deadline ? <ExamCountdown deadline={deadline} onExpire={onExpire ?? (() => {})} /> : <ElapsedTimer startTime={startTime} />}
          {mode !== 'exam' && (
            <IconButton label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} onClick={toggleSound} active={soundEnabled}>
              <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} />
            </IconButton>
          )}
          <IconButton label="Keyboard shortcuts (?)" onClick={onHelp} className="max-md:hidden">
            <Icon name="keyboard" />
          </IconButton>
        </div>
        <div className="px-2">
          <SegmentedProgress statuses={statuses} current={current} />
        </div>
      </div>
    </header>
  )
}
