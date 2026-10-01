import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScoreSummary } from '../components/analytics/ScoreSummary'
import { BreakdownChart } from '../components/analytics/BreakdownChart'
import { QuestionReview } from '../components/analytics/QuestionReview'
import { Button } from '../components/ui/Button'
import { ExamConfetti } from '../components/exam/ExamConfetti'
import { useQuiz } from '../hooks/useQuiz'
import { useSubjectData } from '../hooks/useSubjectData'
import StarBorder from '../components/reactbits/StarBorder'
import CountUp from '../components/reactbits/CountUp'
import {
  EXAM_SUBJECTS,
  EXAM_PASS_THRESHOLD,
  saveExamState,
} from '../lib/examState'

const ANALYTICS_KEY = 'quiz-analytics'

export function ExamResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetQuiz } = useQuiz()
  const { quizzes } = useSubjectData()
  const savedRef = useRef(false)

  // Read analytics data (same key as regular AnalyticsPage)
  const data = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(ANALYTICS_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [])

  // Derive subjectSlug: prefer location state, fallback to EXAM_SUBJECTS lookup
  const subjectSlug = useMemo(() => {
    if (location.state?.subjectSlug) return location.state.subjectSlug
    if (!data) return null
    return EXAM_SUBJECTS.find((s) => s.label === data.subject)?.slug ?? null
  }, [location.state, data])

  // Redirect if no data (direct URL access)
  useEffect(() => {
    if (!data) {
      navigate('/exam', { replace: true })
    }
  }, [data, navigate])

  // Save exam state once on mount
  useEffect(() => {
    if (!data || !subjectSlug || savedRef.current) return
    savedRef.current = true

    const { questions, answers } = data

    // Build quiz question ID set for PDC categorization
    const subjectConfig = EXAM_SUBJECTS.find((s) => s.slug === subjectSlug)
    const quizQuestionIds = new Set()
    if (subjectConfig?.quizSlugs?.length) {
      subjectConfig.quizSlugs.forEach((qSlug) => {
        const qData = quizzes.find((q) => q.slug === qSlug)
        if (qData?.questions) {
          qData.questions.forEach((q) => quizQuestionIds.add(q.id))
        }
      })
    }

    const correctIds = questions
      .filter((q, i) => answers[i] === q.correctIndex)
      .map((q) => q.id)

    const incorrectIds = questions
      .filter((q, i) => answers[i] !== q.correctIndex)
      .map((q) => q.id)

    const quizCorrectIds = correctIds.filter((id) => quizQuestionIds.has(id))
    const quizIncorrectIds = incorrectIds.filter((id) => quizQuestionIds.has(id))

    const { result } = data
    saveExamState(subjectSlug, {
      correctIds,
      incorrectIds,
      quizCorrectIds,
      quizIncorrectIds,
      attempt: {
        date: new Date().toISOString(),
        score: result.score,
        correct: result.correct,
        total: result.total,
        questionIds: questions.map((q) => q.id),
      },
    })
  }, [data, subjectSlug, quizzes])

  if (!data) return null

  const { result: r, subject, questions: qs, answers: ans } = data
  const isPassed = r.score >= EXAM_PASS_THRESHOLD
  const correctCount = r.correct
  const wrongCount = r.total - r.correct
  const subjectConfig = EXAM_SUBJECTS.find((s) => s.slug === subjectSlug)

  function handleRetake() {
    resetQuiz()
    navigate('/exam')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Confetti on pass */}
      {isPassed && <ExamConfetti />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`text-2xl font-black ${isPassed
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {isPassed ? 'Exam Complete' : 'Keep Going'}
          </motion.h1>
          {subjectConfig && (
            <p className="text-sm text-content-secondary mt-0.5">{subjectConfig.examName}</p>
          )}
        </div>
        <Link
          to="/exam"
          className="text-sm text-content-secondary hover:text-themed-accent transition-colors font-semibold"
        >
          Exam Hub →
        </Link>
      </motion.div>

      <div className="space-y-5">
        {/* Score summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 sm:p-8"
        >
          <ScoreSummary
            score={r.score}
            correct={r.correct}
            total={r.total}
            subject={subject}
            timeTaken={r.timeTaken}
          />
        </motion.div>

        {/* Exam-specific outcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`card p-5 border-l-4 ${isPassed
            ? 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
            : 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30'
          }`}
        >
          {isPassed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                  Well done — you passed the simulation.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    <CountUp to={correctCount} from={0} duration={1} />
                  </p>
                  <p className="text-xs text-content-secondary font-semibold">Mastered</p>
                </div>
                {wrongCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-rose-500">
                      <CountUp to={wrongCount} from={0} duration={1} />
                    </p>
                    <p className="text-xs text-content-secondary font-semibold">Will Repeat</p>
                  </div>
                )}
              </div>
              {wrongCount > 0 ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  The <strong>{wrongCount} wrong answer{wrongCount > 1 ? 's' : ''}</strong> are saved and
                  will appear in your next retest — review them below!
                </p>
              ) : (
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                  Perfect score — all questions mastered for this attempt.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-bold text-amber-700 dark:text-amber-300">
                  Every attempt makes you stronger — keep going.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    <CountUp to={correctCount} from={0} duration={1} />
                  </p>
                  <p className="text-xs text-content-secondary font-semibold">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-rose-500">
                    <CountUp to={wrongCount} from={0} duration={1} />
                  </p>
                  <p className="text-xs text-content-secondary font-semibold">Wrong</p>
                </div>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>{wrongCount} question{wrongCount > 1 ? 's' : ''}</strong> answered incorrectly —
                they're queued for your retest. Study the explanations below and try again!
              </p>
            </div>
          )}
        </motion.div>

        {/* Breakdown chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <BreakdownChart correct={r.correct} total={r.total} />
        </motion.div>

        {/* Question review */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-content-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />
            </svg>
            <h2 className="text-base font-extrabold text-content-primary">Question Review</h2>
            {wrongCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400">
                {wrongCount} will repeat
              </span>
            )}
          </div>
          <QuestionReview questions={qs} answers={ans} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/exam')}>
            Back to Exams
          </Button>
          <StarBorder className="flex-1" color="rgb(var(--accent))" speed="5s">
            <Button className="w-full" onClick={handleRetake}>
              Retake
            </Button>
          </StarBorder>
        </motion.div>
      </div>
    </div>
  )
}
