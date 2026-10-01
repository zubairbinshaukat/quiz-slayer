import { Link } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { useSound } from '../../hooks/useSound'
import { Pill } from '../ui/Chip'
import { IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { ElapsedTimer } from './ElapsedTimer'
import { ExamCountdown } from './ExamCountdown'
import { QuizProgress, type QuestionStatus } from './QuizProgress'
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

const MODE_CHIP: Record<QuizMode, { label: string; className: string }> = {
  quiz: { label: 'Practice', className: 'border border-line bg-surface-2 text-muted' },
  exam: { label: 'Exam', className: 'bg-info/12 text-info' },
  retry: { label: 'Retry', className: 'bg-danger/12 text-danger' },
}

/** Focus-mode top bar: exit, subject + mode, timer, sound; progress dots underneath. */
export function QuizHeader({ subject, mode, exitTo, current, statuses, startTime, deadline, onExpire, onHelp }: QuizHeaderProps) {
  const { soundEnabled, toggleSound } = useSound()
  const { lite } = useLiteMode()
  const chip = MODE_CHIP[mode]
  return (
    <header className="glass pt-safe sticky top-0 z-30 border-b border-line">
      <div className="mx-auto max-w-[1088px] px-2 pb-3.5 sm:px-4 lg:px-5">
        <div className="flex h-14 items-center gap-1 md:h-16">
          <Link
            to={exitTo}
            viewTransition={!lite}
            aria-label="Exit quiz (progress is saved)"
            title="Exit (progress is saved)"
            className="press inline-flex size-11 shrink-0 items-center justify-center rounded-btn text-muted hover:bg-surface-2 hover:text-fg"
          >
            <Icon name="back" size={22} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            <p className="truncate text-[15px] font-bold tracking-[-0.01em]">{subject}</p>
            <Pill className={`shrink-0 ${chip.className}`}>{chip.label}</Pill>
          </div>
          {deadline ? <ExamCountdown deadline={deadline} onExpire={onExpire ?? (() => {})} /> : <ElapsedTimer startTime={startTime} />}
          {mode !== 'exam' && (
            <IconButton label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} onClick={toggleSound} active={soundEnabled}>
              <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} />
            </IconButton>
          )}
          <IconButton label="Keyboard shortcuts (?)" onClick={onHelp} className="max-md:hidden lg:hidden">
            <Icon name="keyboard" />
          </IconButton>
        </div>
        <div className="flex items-center gap-3 px-2.5 lg:px-1">
          <QuizProgress statuses={statuses} current={current} />
          <span className="shrink-0 font-mono text-xs font-semibold text-muted">
            <span className="text-fg">{current + 1}</span>/{statuses.length}
          </span>
        </div>
      </div>
    </header>
  )
}
