import { getGrade } from '../../lib/constants'
import { cn, formatTime } from '../../lib/utils'
import { CountUp } from '../ui/CountUp'

const R = 54
const CIRCUMFERENCE = 2 * Math.PI * R

function ScoreCircle({ score }: { score: number }) {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
      {/* Track */}
      <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" strokeWidth="10"
        className="text-surface-secondary" />
      {/* Progress */}
      <circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-themed-accent"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
      />
    </svg>
  )
}

interface ScoreSummaryProps {
  score: number
  correct: number
  total: number
  subject: string
  timeTaken: number
}

export function ScoreSummary({ score, correct, total, subject, timeTaken }: ScoreSummaryProps) {
  const grade = getGrade(score)

  return (
    <div className="text-center animate-fade-in">
      {/* Circle */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <ScoreCircle score={score} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-content-primary">{score}%</span>
          <span className="text-xs text-content-secondary font-semibold">Score</span>
        </div>
      </div>

      {/* Grade badge */}
      <div>
        <span className={cn('inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4', grade.bg, grade.color)}>
          {grade.label}
        </span>
      </div>

      <h2 className="text-2xl font-black text-content-primary mb-1">
        {correct} / {total} Correct
      </h2>
      <p className="text-sm text-content-secondary">{subject}</p>

      {/* Stats row */}
      <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-themed-border">
        <div>
          <p className="text-xl font-black text-content-primary">
            <CountUp to={correct} duration={1.2} />
          </p>
          <p className="text-xs text-emerald-500 font-semibold">Correct</p>
        </div>
        <div className="w-px bg-themed-border" />
        <div>
          <p className="text-xl font-black text-content-primary">
            <CountUp to={total - correct} duration={1.2} />
          </p>
          <p className="text-xs text-rose-500 font-semibold">Wrong</p>
        </div>
        <div className="w-px bg-themed-border" />
        <div>
          <p className="text-xl font-black text-content-primary">{formatTime(timeTaken)}</p>
          <p className="text-xs text-content-secondary font-semibold">Time</p>
        </div>
      </div>
    </div>
  )
}
