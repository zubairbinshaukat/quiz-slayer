import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

export function OptionButton({
  option,
  index,
  selectedIndex,
  correctIndex,
  isSubmitted,
  onClick,
}) {
  const isSelected = selectedIndex === index
  const isCorrect = correctIndex === index
  const isWrongSelected = isSubmitted && isSelected && !isCorrect

  let stateClasses = ''
  let labelClasses = ''

  if (!isSubmitted) {
    if (isSelected) {
      stateClasses = 'border-themed-accent bg-themed-accent/10 shadow-glow'
      labelClasses = 'bg-themed-accent text-white'
    } else {
      stateClasses = 'border-themed-border bg-surface-card hover:border-themed-accent/50 hover:bg-themed-accent/5'
      labelClasses = 'bg-surface-secondary text-content-secondary'
    }
  } else {
    if (isCorrect) {
      stateClasses = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm'
      labelClasses = 'bg-emerald-500 text-white'
    } else if (isWrongSelected) {
      stateClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 shadow-sm'
      labelClasses = 'bg-rose-500 text-white'
    } else {
      stateClasses = 'border-themed-border bg-surface-card opacity-45'
      labelClasses = 'bg-surface-secondary text-content-secondary'
    }
  }

  return (
    <motion.button
      whileTap={isSubmitted ? {} : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={isSubmitted ? undefined : onClick}
      disabled={isSubmitted}
      className={cn(
        'w-full flex items-center gap-3.5 p-4 rounded-xl border-2',
        'text-left transition-all duration-200 font-semibold',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-themed-accent',
        'disabled:cursor-default',
        stateClasses
      )}
    >
      {/* Letter label */}
      <span className={cn(
        'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
        'text-xs font-black transition-colors duration-200',
        labelClasses
      )}>
        {LABELS[index] ?? index + 1}
      </span>

      {/* Option text */}
      <span className="text-sm sm:text-base text-content-primary">{option}</span>

      {/* Result icon */}
      {isSubmitted && isCorrect && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="ml-auto text-emerald-500 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.span>
      )}
      {isSubmitted && isWrongSelected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="ml-auto text-rose-500 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.span>
      )}
    </motion.button>
  )
}
