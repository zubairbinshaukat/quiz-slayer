import { useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScoreSummary } from '../components/analytics/ScoreSummary'
import { BreakdownChart } from '../components/analytics/BreakdownChart'
import { QuestionReview } from '../components/analytics/QuestionReview'
import { Button } from '../components/ui/Button'
import { useQuiz } from '../hooks/useQuiz'
import StarBorder from '../components/reactbits/StarBorder'

const ANALYTICS_KEY = 'quiz-analytics'

export function AnalyticsPage() {
  const navigate = useNavigate()
  const { status, subject, questions, answers, result, resetQuiz } = useQuiz()

  // Prefer live context data; fall back to sessionStorage for page refresh / back-navigation
  const data = useMemo(() => {
    if (status === 'completed' && result) {
      return { result, subject, questions, answers }
    }
    try {
      const stored = sessionStorage.getItem(ANALYTICS_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [status, result, subject, questions, answers])

  useEffect(() => {
    if (!data) {
      navigate('/', { replace: true })
    }
  }, [data, navigate])

  if (!data) return null

  const { result: r, subject: sub, questions: qs, answers: ans } = data

  function handleRetake() {
    resetQuiz()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-black text-content-primary">Quiz Complete!</h1>
        <Link to="/history" className="text-sm text-content-secondary hover:text-themed-accent transition-colors font-semibold">
          View History →
        </Link>
      </motion.div>

      <div className="space-y-5">
        {/* Score summary card */}
        <div className="card p-6 sm:p-8">
          <ScoreSummary
            score={r.score}
            correct={r.correct}
            total={r.total}
            subject={sub}
            timeTaken={r.timeTaken}
          />
        </div>

        {/* Breakdown card */}
        <div className="card p-6">
          <BreakdownChart correct={r.correct} total={r.total} />
        </div>

        {/* Question review card */}
        <div className="card p-6">
          <QuestionReview questions={qs} answers={ans} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <StarBorder className="flex-1" color="rgb(var(--accent))" speed="5s">
            <Button className="w-full" onClick={handleRetake}>
              Try Another
            </Button>
          </StarBorder>
        </div>
      </div>
    </div>
  )
}
