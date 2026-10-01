import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { HistoryCard } from '../components/history/HistoryCard'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useQuizHistory } from '../hooks/useQuizHistory'
import CountUp from '../components/reactbits/CountUp'

export function HistoryPage() {
  const { history, loading, removeEntry, clearHistory } = useQuizHistory()
  const [confirmClear, setConfirmClear] = useState(false)

  // Unique subjects for filter
  const subjects = [...new Set(history.map((e) => e.subject))].sort()
  const [filterSubject, setFilterSubject] = useState('all')

  const filtered = filterSubject === 'all'
    ? history
    : history.filter((e) => e.subject === filterSubject)

  // Stats
  const totalAttempts = history.length
  const avgScore = totalAttempts > 0
    ? Math.round(history.reduce((sum, e) => sum + e.score, 0) / totalAttempts)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-content-primary">Quiz History</h1>
        {history.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-content-secondary">Are you sure?</span>
              <Button size="sm" variant="danger" onClick={() => { clearHistory(); setConfirmClear(false) }}>
                Yes, clear all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmClear(true)}>
              Clear all
            </Button>
          )
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 text-content-secondary"
        >
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-semibold">No history yet</p>
          <p className="text-sm mt-1">Complete a quiz to see your results here.</p>
        </motion.div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-content-primary mb-1">
                <CountUp to={totalAttempts} from={0} duration={1} className="text-3xl font-black" />
              </p>
              <p className="text-xs text-content-secondary font-bold uppercase tracking-wide">Total Attempts</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-themed-accent mb-1">
                <CountUp to={avgScore} from={0} duration={1.2} className="text-3xl font-black" separator="" />
                <span className="text-3xl font-black">%</span>
              </p>
              <p className="text-xs text-content-secondary font-bold uppercase tracking-wide">Avg Score</p>
            </div>
          </div>

          {/* Subject filter */}
          {subjects.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilterSubject('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterSubject === 'all'
                    ? 'bg-themed-accent text-white'
                    : 'bg-surface-secondary text-content-secondary hover:bg-themed-accent/10 hover:text-themed-accent'
                }`}
              >
                All
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSubject(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    filterSubject === s
                      ? 'bg-themed-accent text-white'
                      : 'bg-surface-secondary text-content-secondary hover:bg-themed-accent/10 hover:text-themed-accent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* History list */}
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={removeEntry}
                />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="text-center text-content-secondary text-sm py-8">
                No entries for this subject.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
