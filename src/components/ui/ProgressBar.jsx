import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function ProgressBar({ value = 0, className, showLabel = false }) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-content-secondary mb-1.5">
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
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
