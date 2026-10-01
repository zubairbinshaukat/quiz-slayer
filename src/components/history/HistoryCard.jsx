import { motion } from 'framer-motion'
import { getGrade } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { formatDate, formatTime } from '../../lib/utils'

export function HistoryCard({ entry, onDelete }) {
  const grade = getGrade(entry.score)
  const percentage = entry.score

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
      className="card p-4 flex items-center gap-4 group hover:shadow-card-hover transition-shadow duration-200"
    >
      {/* Score circle with ring */}
      <div className="flex-shrink-0 relative">
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
          <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="4"
            className="text-surface-secondary" />
          <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" strokeLinecap="round"
            stroke="currentColor"
            className={grade.color.split(' ')[0]}
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - percentage / 100)}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-xs font-black leading-none', grade.color.split(' ')[0])}>{entry.score}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-extrabold text-content-primary text-sm truncate">{entry.subject}</p>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0', grade.bg, grade.color.split(' ')[0])}>
            {grade.label}
          </span>
        </div>
        <p className="text-xs text-content-secondary">
          {entry.correct}/{entry.total} correct · {formatTime(entry.timeTaken)}
        </p>
        <p className="text-xs text-content-secondary mt-0.5 opacity-70">{formatDate(entry.dateTaken)}</p>
      </div>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(entry.id)}
          className="flex-shrink-0 p-2 rounded-xl text-content-secondary opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-200"
          aria-label="Delete entry"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}
