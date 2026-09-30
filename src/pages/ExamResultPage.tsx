import { useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { QuestionReview } from '../components/analytics/QuestionReview'
import { ScoreHero } from '../components/analytics/ScoreHero'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Confetti } from '../components/ui/Confetti'
import { Icon } from '../components/ui/Icon'
import { StatStrip } from '../components/ui/StatStrip'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useSubjectData } from '../hooks/useSubjectData'
import { readAnalyticsSnapshot } from '../lib/analyticsSnapshot'
import { ROUTES } from '../lib/constants'
import { buildExamSubjects, EXAM_PASS_THRESHOLD, saveExamState } from '../lib/examState'
import { usePageMeta } from '../lib/seo'
import { cn, formatClock } from '../lib/utils'
import { isRecord, type QuestionId } from '../types'

export function ExamResultPage() {
  usePageMeta({ title: 'Exam result', path: ROUTES.EXAM_RESULT })
  const nav = useNav()
  const location = useLocation()
  const { resetQuiz } = useQuiz()
  const { subjects, quizzes } = useSubjectData()
  const examSubjects = useMemo(() => buildExamSubjects(subjects), [subjects])
  const savedRef = useRef(false)

  // Same snapshot the regular results page reads
  const data = useMemo(() => readAnalyticsSnapshot(), [])

  const stateSlug: string | null =
    isRecord(location.state) && typeof location.state.subjectSlug === 'string' ? location.state.subjectSlug : null

  // Prefer location state, fall back to exam subject lookup by label
  const subjectSlug = useMemo(() => {
    if (stateSlug) return stateSlug
    if (!data) return null
    return examSubjects.find((s) => s.label === data.subject)?.slug ?? null
  }, [stateSlug, data, examSubjects])

  useEffect(() => {
    if (!data) nav(ROUTES.EXAM, { replace: true })
  }, [data, nav])

  // Save exam mastery state once
  useEffect(() => {
    if (!data || !subjectSlug || savedRef.current) return
    savedRef.current = true
    const { questions, answers, result } = data

    // Quiz question ids for 'main+quiz' categorisation
    const subjectConfig = examSubjects.find((s) => s.slug === subjectSlug)
    const quizQuestionIds = new Set<QuestionId>()
    subjectConfig?.quizSlugs.forEach((qSlug) => {
      quizzes.find((q) => q.slug === qSlug)?.questions.forEach((q) => quizQuestionIds.add(q.id))
    })

    const correctIds = questions.filter((q, i) => answers[i] === q.correctIndex).map((q) => q.id)
    const incorrectIds = questions.filter((q, i) => answers[i] !== q.correctIndex).map((q) => q.id)

    saveExamState(subjectSlug, {
      correctIds,
      incorrectIds,
      quizCorrectIds: correctIds.filter((id) => quizQuestionIds.has(id)),
      quizIncorrectIds: incorrectIds.filter((id) => quizQuestionIds.has(id)),
      attempt: {
        date: new Date().toISOString(),
        score: result.score,
        correct: result.correct,
        total: result.total,
        questionIds: questions.map((q) => q.id),
      },
    })
  }, [data, subjectSlug, quizzes, examSubjects])

  if (!data) return null

  const { result: r } = data
  const passed = r.score >= EXAM_PASS_THRESHOLD
  const wrongCount = r.total - r.correct
  const subjectConfig = examSubjects.find((s) => s.slug === subjectSlug)

  function handleRetake() {
    resetQuiz()
    nav(ROUTES.EXAM)
  }

  return (
    <Page>
      {passed && <Confetti />}
      <h1 className="sr-only">Exam result</h1>

      <ScoreHero score={r.score} subject={subjectConfig?.examName ?? data.subject} eyebrow={passed ? 'Exam passed' : 'Keep going'} />

      <StatStrip
        className="mt-3"
        stats={[
          { label: passed ? 'Mastered' : 'Correct', value: r.correct, tone: 'text-success' },
          { label: 'Will repeat', value: wrongCount, tone: wrongCount > 0 ? 'text-danger' : undefined },
          { label: 'Time', value: <span className="font-mono text-lg">{formatClock(r.timeTaken)}</span> },
        ]}
      />

      <div
        role="status"
        className={cn(
          'card mt-3 flex items-start gap-3 p-4 text-sm leading-relaxed',
          passed ? 'border-success/30' : 'border-accent/30',
        )}
      >
        <Icon name={passed ? 'check' : 'info'} size={18} className={cn('mt-0.5 shrink-0', passed ? 'text-success' : 'text-accent-fg')} />
        <p>
          {passed ? 'You passed the simulation. ' : 'Every attempt makes you stronger. '}
          {wrongCount > 0
            ? `${wrongCount} wrong answer${wrongCount === 1 ? ' is' : 's are'} saved and will reappear in your next retest — review them below.`
            : 'Perfect score — every question in this attempt is mastered.'}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => nav(ROUTES.EXAM)}>
          <Icon name="back" size={18} />
          Exams
        </Button>
        <Button className="flex-1" onClick={handleRetake}>
          <Icon name="refresh" size={18} />
          Retake
        </Button>
      </div>

      <div className="mt-8">
        <QuestionReview questions={data.questions} answers={data.answers} />
      </div>
    </Page>
  )
}
