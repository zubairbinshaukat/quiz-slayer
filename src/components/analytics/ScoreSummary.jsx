import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { getGrade } from '../../lib/constants'
import { formatTime } from '../../lib/utils'
import { cn } from '../../lib/utils'
import CountUp from '../reactbits/CountUp'

function AnimatedCircle({ score }) {
  const R = 54
  const CIRCUMFERENCE = 2 * Math.PI * R
  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, (v) => CIRCUMFERENCE * (1 - v / 100))

  useEffect(() => {
    const controls = animate(progress, score, { duration: 1.2, ease: 'easeOut' })
    return controls.stop
  }, [score, progress])

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
      {/* Track */}
      <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" strokeWidth="10"
        className="text-surface-secondary" />
      {/* Progress */}
      <motion.circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-themed-accent"
        strokeDasharray={CIRCUMFERENCE}
        style={{ strokeDashoffset: dashOffset }}
      />
    </svg>
  )
}

export function ScoreSummary({ score, correct, total, subject, timeTaken }) {
  const grade = getGrade(score)

  return (
    <div className="text-center">
      {/* Circle */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <AnimatedCircle score={score} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-black text-content-primary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {score}%
          </motion.span>
          <span className="text-xs text-content-secondary font-semibold">Score</span>
        </div>
      </div>

      {/* Grade badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <span className={cn('inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4', grade.bg, grade.color)}>
          {grade.label}
        </span>
      </motion.div>

      <motion.h2
        className="text-2xl font-black text-content-primary mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {correct} / {total} Correct
      </motion.h2>
      <p className="text-sm text-content-secondary">{subject}</p>

      {/* Stats row */}
      <motion.div
        className="flex justify-center gap-6 mt-5 pt-5 border-t border-themed-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div>
          <p className="text-xl font-black text-content-primary">
            <CountUp to={correct} from={0} duration={1.2} className="text-xl font-black" />
          </p>
          <p className="text-xs text-emerald-500 font-semibold">Correct</p>
        </div>
        <div className="w-px bg-themed-border" />
        <div>
          <p className="text-xl font-black text-content-primary">
            <CountUp to={total - correct} from={0} duration={1.2} className="text-xl font-black" />
          </p>
          <p className="text-xs text-rose-500 font-semibold">Wrong</p>
        </div>
        <div className="w-px bg-themed-border" />
        <div>
          <p className="text-xl font-black text-content-primary">{formatTime(timeTaken)}</p>
          <p className="text-xs text-content-secondary font-semibold">Time</p>
        </div>
      </motion.div>
    </div>
  )
}
