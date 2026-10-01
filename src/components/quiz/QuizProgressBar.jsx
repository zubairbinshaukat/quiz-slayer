import { motion } from 'framer-motion'

export function QuizProgressBar({ current, total, answeredCount }) {
  const pct = total > 0 ? ((current) / total) * 100 : 0

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="font-semibold text-content-primary">
          Question <span className="text-themed-accent">{current}</span> of {total}
        </span>
        <span className="text-content-secondary text-xs">
          {answeredCount} answered
        </span>
      </div>
      <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-themed-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
