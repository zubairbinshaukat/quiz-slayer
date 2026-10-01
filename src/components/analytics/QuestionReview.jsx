import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

function ReviewItem({ question, userAnswer, index }) {
  const [open, setOpen] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const isCorrect = userAnswer === question.correctIndex
  const isSkipped = userAnswer === null

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-colors',
      isCorrect ? 'border-emerald-200 dark:border-emerald-800' :
      isSkipped ? 'border-themed-border' :
      'border-rose-200 dark:border-rose-800'
    )}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-secondary transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Status icon */}
        <span className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
          isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-surface-secondary' : 'bg-rose-500'
        )}>
          {isCorrect ? '✓' : isSkipped ? '–' : '✗'}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-content-secondary mb-0.5">Q{index + 1}</p>
          <p className="text-sm font-semibold text-content-primary truncate">{question.text}</p>
        </div>

        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-content-secondary flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-themed-border pt-3">
              {question.options.map((option, i) => {
                const isOpt = i === question.correctIndex
                const isUserOpt = i === userAnswer
                const isWrong = isUserOpt && !isOpt

                return (
                  <div key={i} className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
                    isOpt ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' :
                    isWrong ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' :
                    'text-content-secondary'
                  )}>
                    <span className={cn(
                      'w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold',
                      isOpt ? 'bg-emerald-500 text-white' :
                      isWrong ? 'bg-rose-500 text-white' :
                      'bg-surface-secondary text-content-secondary'
                    )}>
                      {LABELS[i]}
                    </span>
                    <span>{option}</span>
                    {isOpt && <span className="ml-auto text-xs font-bold">✓ Correct</span>}
                    {isWrong && <span className="ml-auto text-xs font-bold">✗ Your answer</span>}
                  </div>
                )
              })}

              {/* Explanation */}
              {(question.shortExplanation || question.explanation) && (
                <div className="mt-3 pt-3 border-t border-themed-border">
                  <div className="flex items-start gap-2">
                    <span className="text-xs">💡</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">Quick Answer</p>
                      <p className="text-xs text-content-secondary leading-relaxed">
                        {question.shortExplanation || question.explanation.split('.').slice(0, 2).join('.') + '.'}
                      </p>

                      {question.explanation && (
                        <>
                          <button
                            onClick={() => setShowFull((v) => !v)}
                            className="mt-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                          >
                            {showFull ? '▲ Show Less' : '▼ Know More'}
                          </button>

                          <AnimatePresence>
                            {showFull && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-1.5 pt-1.5 border-t border-themed-border">
                                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">Detailed Explanation</p>
                                  <div className="text-xs text-content-secondary leading-relaxed space-y-1.5">
                                    {question.explanation.split('\n\n').map((para, i) => (
                                      <p key={i}>{para}</p>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function QuestionReview({ questions, answers }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-content-secondary uppercase tracking-wide mb-4">
        Question Review
      </h3>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <ReviewItem
            key={q.id}
            question={q}
            userAnswer={answers[i] ?? null}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
