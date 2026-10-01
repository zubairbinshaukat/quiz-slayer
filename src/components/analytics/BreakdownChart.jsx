import { motion } from 'framer-motion'

export function BreakdownChart({ correct, total }) {
  const wrong = total - correct
  const correctPct = total > 0 ? (correct / total) * 100 : 0
  const wrongPct = total > 0 ? (wrong / total) * 100 : 0

  return (
    <div>
      <h3 className="text-sm font-bold text-content-secondary uppercase tracking-wide mb-4">
        Results Breakdown
      </h3>

      <div className="space-y-3">
        {/* Correct bar */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Correct
            </span>
            <span className="font-bold text-content-primary">{correct} ({Math.round(correctPct)}%)</span>
          </div>
          <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${correctPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>

        {/* Wrong bar */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Incorrect
            </span>
            <span className="font-bold text-content-primary">{wrong} ({Math.round(wrongPct)}%)</span>
          </div>
          <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${wrongPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
