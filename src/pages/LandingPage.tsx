import { useMemo, useState } from 'react'
import { AddSubjectCard } from '../components/landing/AddSubjectCard'
import { DevCredit } from '../components/landing/DevCredit'
import { GreetingRow } from '../components/landing/GreetingRow'
import { InstallCard } from '../components/landing/InstallCard'
import { LinkBanner } from '../components/landing/LinkBanner'
import { SubjectCard } from '../components/landing/SubjectCard'
import { Page } from '../components/layout/Page'
import { QuizSetupSheet } from '../components/quiz/QuizSetupSheet'
import { StatStrip } from '../components/ui/StatStrip'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useQuizHistory } from '../hooks/useQuizHistory'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { getMasteredCount, getTotalMistakes } from '../lib/mastery'
import { getMistakeIds, getSubjectStats } from '../lib/mistakes'
import { usePageMeta } from '../lib/seo'
import { computeStreak } from '../lib/streak'
import { allSubjectQuestions } from '../lib/subjectUtils'
import { shuffleArray } from '../lib/utils'
import type { HistoryEntry, Question, QuizMode, Subject } from '../types'

interface SubjectView {
  subject: Subject
  best: number | null
  mastery: number
  mistakeQuestions: Question[]
}

function buildView(subject: Subject, history: HistoryEntry[]): SubjectView {
  const stats = getSubjectStats(history, subject.slug)
  const open = new Set(getMistakeIds(history, subject.slug))
  const total = subject.questions.length
  return {
    subject,
    best: stats.attempts > 0 ? stats.best : null,
    mastery: total > 0 ? Math.min(1, getMasteredCount(history, subject.slug) / total) : 0,
    // Older attempts may include guess questions: keep them practicable until cleared
    mistakeQuestions: open.size > 0 ? allSubjectQuestions(subject).filter((q) => open.has(String(q.id))) : [],
  }
}

const CAROUSEL = 'no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0'
const CAROUSEL_ITEM = 'w-[74%] max-w-[290px] shrink-0 snap-start md:w-auto md:max-w-none'

export function LandingPage() {
  usePageMeta({ path: '/' })
  const { subjects, quizzes, getSubjectBySlug } = useSubjectData()
  const { history, loading: historyLoading } = useQuizHistory()
  const { startQuiz } = useQuiz()
  const nav = useNav()

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const selectedSubject = selectedSlug ? getSubjectBySlug(selectedSlug) : null

  const subjectViews = useMemo(() => subjects.map((s) => buildView(s, history)), [subjects, history])
  const quizViews = useMemo(() => quizzes.map((s) => buildView(s, history)), [quizzes, history])
  const streak = useMemo(() => computeStreak(history), [history])
  const avgScore = history.length ? Math.round(history.reduce((sum, e) => sum + e.score, 0) / history.length) : 0
  const mistakesTotal = useMemo(() => getTotalMistakes(history), [history])

  function begin(subject: Subject, questions: Question[], mode: QuizMode = 'quiz') {
    if (questions.length === 0) return
    startQuiz(subject, questions, mode)
    nav(ROUTES.QUIZ_PATH(subject.slug))
  }

  function handleConfirm(questions: Question[], mode: 'quiz' | 'exam') {
    if (!selectedSubject) return
    const subject = selectedSubject
    setSelectedSlug(null)
    begin(subject, questions, mode)
  }

  function renderCard(view: SubjectView, index: number, direct: boolean) {
    const { subject } = view
    return (
      <SubjectCard
        key={subject.slug}
        className={CAROUSEL_ITEM}
        index={index}
        subject={subject.subject}
        slug={subject.slug}
        questionCount={subject.questionCount}
        best={view.best}
        mastery={view.mastery}
        mistakes={view.mistakeQuestions.length}
        onStart={() => (direct ? begin(subject, shuffleArray(subject.questions)) : setSelectedSlug(subject.slug))}
        onPracticeMistakes={() => begin(subject, shuffleArray(view.mistakeQuestions), 'retry')}
      />
    )
  }

  return (
    <Page wide>
      <GreetingRow streak={streak} />

      {convexEnabled && !historyLoading && <LinkBanner attempts={history.length} />}

      <InstallCard />

      <StatStrip
        className="mt-5"
        stats={[
          { label: 'Attempts', value: history.length },
          { label: 'Avg score', value: history.length ? `${avgScore}%` : '—' },
          { label: 'Mistakes', value: mistakesTotal, tone: mistakesTotal > 0 ? 'text-danger' : undefined },
        ]}
      />

      <section aria-labelledby="subjects-heading" className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="subjects-heading" className="text-xl">Subjects</h2>
          <span className="text-sm text-muted md:hidden">Swipe for more</span>
        </div>
        <div className={CAROUSEL}>
          {subjectViews.map((view, i) => renderCard(view, i, false))}
          <AddSubjectCard className={CAROUSEL_ITEM} index={subjectViews.length} />
        </div>
      </section>

      {quizViews.length > 0 && (
        <section aria-labelledby="quizzes-heading" className="mt-8">
          <h2 id="quizzes-heading" className="mb-3 text-xl">Quick quizzes</h2>
          <div className={CAROUSEL}>{quizViews.map((view, i) => renderCard(view, i, true))}</div>
        </section>
      )}

      <DevCredit />

      <QuizSetupSheet
        key={selectedSlug ?? 'none'}
        subject={selectedSubject}
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSlug(null)}
        onConfirm={handleConfirm}
      />
    </Page>
  )
}
