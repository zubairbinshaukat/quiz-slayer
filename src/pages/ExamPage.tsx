import { useMemo } from 'react'
import { ExamSubjectCard } from '../components/exam/ExamSubjectCard'
import { Page, PageHeader } from '../components/layout/Page'
import { Icon } from '../components/ui/Icon'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import {
  buildExamSubjects,
  EXAM_MODE_SESSION_KEY,
  EXAM_PASS_THRESHOLD,
  EXAM_QUESTION_COUNT,
  getExamState,
  getTotalPoolSize,
  selectExamQuestions,
  type QuizDataMap,
} from '../lib/examState'
import { usePageMeta } from '../lib/seo'
import type { ExamSubjectConfig, Subject } from '../types'

export function ExamPage() {
  usePageMeta({
    title: 'Mock exams',
    description: `Adaptive mock exams: up to ${EXAM_QUESTION_COUNT} MCQs per subject, wrong answers repeat until mastered.`,
    path: ROUTES.EXAM,
  })
  const { subjects, quizzes } = useSubjectData()
  const { startQuiz } = useQuiz()
  const nav = useNav()
  const examSubjects = useMemo(() => buildExamSubjects(subjects), [subjects])

  function getSubjectData(slug: string): Subject | null {
    return subjects.find((s) => s.slug === slug) ?? null
  }

  function getQuizDataMap(config: ExamSubjectConfig): QuizDataMap {
    return config.quizSlugs.reduce<QuizDataMap>((acc, slug) => {
      acc[slug] = quizzes.find((q) => q.slug === slug) ?? null
      return acc
    }, {})
  }

  function handleStartExam(config: ExamSubjectConfig) {
    const subjectData = getSubjectData(config.slug)
    if (!subjectData) return
    const questions = selectExamQuestions(config, subjectData, getQuizDataMap(config), getExamState(config.slug))
    if (questions.length === 0) return
    startQuiz({ subject: config.label, slug: config.slug }, questions, 'exam')
    sessionStorage.setItem(EXAM_MODE_SESSION_KEY, JSON.stringify({ subjectSlug: config.slug }))
    nav(ROUTES.QUIZ_PATH(config.slug))
  }

  return (
    <Page>
      <PageHeader
        title="Mock exams"
        subtitle={`Up to ${EXAM_QUESTION_COUNT} adaptive MCQs per subject. Wrong answers come back until you master them.`}
      />

      {examSubjects.length === 0 ? (
        <p className="card px-4 py-10 text-center text-sm text-muted">No subjects available yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {examSubjects.map((config, index) => {
            const subjectData = getSubjectData(config.slug)
            return (
              <ExamSubjectCard
                key={config.slug}
                config={config}
                examState={getExamState(config.slug)}
                totalPoolSize={subjectData ? getTotalPoolSize(config, subjectData, getQuizDataMap(config)) : 0}
                onStart={handleStartExam}
                index={index}
              />
            )
          })}
        </div>
      )}

      <div className="card mt-6 flex items-start gap-3 p-4 text-sm leading-relaxed text-muted">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-accent-fg" />
        <p>
          <span className="font-semibold text-fg">How it works — </span>
          each session picks up to {EXAM_QUESTION_COUNT} questions. Correct answers are mastered and drop out of future
          attempts; wrong answers are saved and reappear until you get them right. Pass mark is {EXAM_PASS_THRESHOLD}%.
        </p>
      </div>
    </Page>
  )
}
