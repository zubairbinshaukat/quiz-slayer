import { useMemo, useState } from 'react'
import { AddSubjectCard } from '../components/landing/AddSubjectCard'
import { DevCredit } from '../components/landing/DevCredit'
import { GreetingRow } from '../components/landing/GreetingRow'
import { SubjectCard } from '../components/landing/SubjectCard'
import { Page } from '../components/layout/Page'
import { GuessWarningModal } from '../components/quiz/GuessWarningModal'
import { QuizSetupSheet } from '../components/quiz/QuizSetupSheet'
import { StatStrip } from '../components/ui/StatStrip'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useQuizHistory } from '../hooks/useQuizHistory'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import { isGuessSubject, isGuessWarningDismissed, setGuessWarningDismissed } from '../lib/guessWarning'
import { getMasteredCount, getTotalMistakes } from '../lib/mastery'
import { getMistakeIds, getSubjectStats } from '../lib/mistakes'
import { usePageMeta } from '../lib/seo'
import { computeStreak } from '../lib/streak'
import { allSubjectQuestions } from '../lib/subjectUtils'
import { shuffleArray } from '../lib/utils'
import type { HistoryEntry, Question, Subject } from '../types'

interface PendingGuessWarning {
  subjectName: string
  onProceed: () => void
}

interface SubjectView {
  subject: Subject
  best: number | null
  mastery: number
  mistakeQuestions: Question[]
}

function buildView(subject: Subject, history: HistoryEntry[]): SubjectView {
  const all = allSubjectQuestions(subject)
  const stats = getSubjectStats(history, subject.slug)
  const open = new Set(getMistakeIds(history, subject.slug))
  return {
    subject,
    best: stats.attempts > 0 ? stats.best : null,
    mastery: all.length > 0 ? Math.min(1, getMasteredCount(history, subject.slug) / all.length) : 0,
    mistakeQuestions: open.size > 0 ? all.filter((q) => open.has(String(q.id))) : [],
  }
}

const CAROUSEL = 'no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0'
const CAROUSEL_ITEM = 'w-[74%] max-w-[290px] shrink-0 snap-start md:w-auto md:max-w-none'

export function LandingPage() {
  usePageMeta({ path: '/' })
  const { subjects, quizzes, getSubjectBySlug } = useSubjectData()
  const { history } = useQuizHistory()
  const { startQuiz } = useQuiz()
  const nav = useNav()

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [guessWarning, setGuessWarning] = useState<PendingGuessWarning | null>(null)
  const selectedSubject = selectedSlug ? getSubjectBySlug(selectedSlug) : null

  const subjectViews = useMemo(() => subjects.map((s) => buildView(s, history)), [subjects, history])
  const quizViews = useMemo(() => quizzes.map((s) => buildView(s, history)), [quizzes, history])
  const streak = useMemo(() => computeStreak(history), [history])
  const avgScore = history.length ? Math.round(history.reduce((sum, e) => sum + e.score, 0) / history.length) : 0
  const mistakesTotal = useMemo(() => getTotalMistakes(history), [history])

  function withGuessWarning(slug: string, onProceed: () => void) {
    if (isGuessSubject(slug) && !isGuessWarningDismissed()) {
      setGuessWarning({ subjectName: getSubjectBySlug(slug)?.subject ?? '', onProceed })
      return
    }
    onProceed()
  }

  function begin(subject: Subject, questions: Question[], mode: 'quiz' | 'retry' = 'quiz') {
    if (questions.length === 0) return
    startQuiz(subject, questions, mode)
    nav(ROUTES.QUIZ_PATH(subject.slug))
  }

  function handleConfirm(count: number, pool: Question[]) {
    if (!selectedSubject) return
    const subject = selectedSubject
    setSelectedSlug(null)
    begin(subject, shuffleArray(pool).slice(0, count))
  }

  function handleGuessContinue(dismissForever: boolean) {
    if (dismissForever) setGuessWarningDismissed()
    const pending = guessWarning
    setGuessWarning(null)
    pending?.onProceed()
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
        questionCount={subject.questionCount + subject.guessQuestions.length}
        best={view.best}
        mastery={view.mastery}
        mistakes={view.mistakeQuestions.length}
        isGuess={subject.isGuess}
        onStart={() =>
          withGuessWarning(subject.slug, () =>
            direct ? begin(subject, shuffleArray(subject.questions)) : setSelectedSlug(subject.slug),
          )
        }
        onPracticeMistakes={() =>
          withGuessWarning(subject.slug, () => begin(subject, shuffleArray(view.mistakeQuestions), 'retry'))
        }
      />
    )
  }

  return (
    <Page wide>
      <GreetingRow streak={streak} />

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

      <GuessWarningModal
        isOpen={!!guessWarning}
        subjectName={guessWarning?.subjectName}
        onClose={() => setGuessWarning(null)}
        onContinue={handleGuessContinue}
      />

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
