import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { LeaderboardMini } from '../components/dashboard/LeaderboardMini'
import { ContinueCard } from '../components/dashboard/ResumeCard'
import { StatTiles } from '../components/dashboard/StatTiles'
import { StreakCard } from '../components/dashboard/StreakCard'
import { AddSubjectCard } from '../components/landing/AddSubjectCard'
import { DevCredit } from '../components/landing/DevCredit'
import { InstallCard } from '../components/landing/InstallCard'
import { LinkBanner } from '../components/landing/LinkBanner'
import { SubjectCard } from '../components/landing/SubjectCard'
import { Page } from '../components/layout/Page'
import { QuizSetupSheet } from '../components/quiz/QuizSetupSheet'
import { Icon } from '../components/ui/Icon'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useLiteMode } from '../hooks/useLiteMode'
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useQuizHistory } from '../hooks/useQuizHistory'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { getMasteredCount, getTotalMistakes } from '../lib/mastery'
import { getMistakeIds, getSubjectStats } from '../lib/mistakes'
import { getSavedProgress } from '../lib/quizProgress'
import { usePageMeta } from '../lib/seo'
import { lsGet, lsSet } from '../lib/storage'
import { RESUME_DISMISSED_KEY } from '../lib/storageKeys'
import { computeBestStreak, computeStreak, currentWeek } from '../lib/streak'
import { allSubjectQuestions } from '../lib/subjectUtils'
import { shuffleArray } from '../lib/utils'
import type { HistoryEntry, Question, QuizMode, SavedProgress, Subject } from '../types'

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

/** Most recently started quiz that was left mid-way (any subject or quick quiz). */
function latestSavedProgress(subjects: Subject[]): SavedProgress | null {
  let latest: SavedProgress | null = null
  for (const s of subjects) {
    const p = getSavedProgress(s.slug)
    if (!p || p.questions.length === 0 || !p.answers.some((a) => a !== null)) continue
    if (!latest || p.startTime > latest.startTime) latest = p
  }
  return latest
}

/** Identifies one unfinished quiz, so dismissing its card doesn't hide the next one. */
function resumeKey(p: SavedProgress): string {
  return `${p.slug}@${p.startTime}`
}

const CAROUSEL =
  'no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3'
const CAROUSEL_ITEM = 'w-[78vw] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none'

export function LandingPage() {
  usePageMeta({ path: '/' })
  const { subjects, quizzes, getSubjectBySlug } = useSubjectData()
  const { history, loading: historyLoading } = useQuizHistory()
  const { startQuiz, rehydrateFromProgress } = useQuiz()
  const board = useLeaderboard()
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const { lite } = useLiteMode()
  const nav = useNav()

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const selectedSubject = selectedSlug ? getSubjectBySlug(selectedSlug) : null

  const subjectViews = useMemo(() => subjects.map((s) => buildView(s, history)), [subjects, history])
  const quizViews = useMemo(() => quizzes.map((s) => buildView(s, history)), [quizzes, history])
  const streak = useMemo(() => computeStreak(history), [history])
  const bestStreak = useMemo(() => computeBestStreak(history), [history])
  const week = useMemo(() => currentWeek(history), [history])
  const mistakesTotal = useMemo(() => getTotalMistakes(history), [history])
  const saved = useMemo(() => latestSavedProgress([...subjects, ...quizzes]), [subjects, quizzes])
  const [dismissedResume, setDismissedResume] = useState(() => lsGet(RESUME_DISMISSED_KEY))

  // Hero line: progress in the subject played last (or the first subject)
  const focus = useMemo(() => {
    const last = [...history].sort((a, b) => b.dateTaken.localeCompare(a.dateTaken))[0]
    return subjectViews.find((v) => v.subject.slug === last?.slug) ?? subjectViews[0] ?? null
  }, [history, subjectViews])

  function begin(subject: Subject, questions: Question[], mode: QuizMode = 'quiz') {
    if (questions.length === 0) return
    startQuiz(subject, questions, mode)
    nav(ROUTES.QUIZ_PATH(subject.slug))
  }

  function resume(progress: SavedProgress) {
    rehydrateFromProgress(progress)
    nav(ROUTES.QUIZ_PATH(progress.slug))
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
        index={index + 5}
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

  const name = board.player?.nameChosen ? board.player.name : null
  const subline =
    history.length > 0 && focus ? (
      <>
        You've cleared <span className="font-semibold text-fg">{Math.round(focus.mastery * focus.subject.questionCount)}</span> of{' '}
        {focus.subject.questionCount} questions in <span className="font-semibold text-fg">{focus.subject.subject}</span>
      </>
    ) : (
      'Short, sharp MCQ rounds with instant feedback. Pick a subject and start your streak today.'
    )

  return (
    <Page>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="min-w-0 space-y-5">
          <DashboardHero name={name} subline={subline} streak={streak} week={week} />

          {convexEnabled && !historyLoading && <LinkBanner attempts={history.length} />}
          {!desktop && <InstallCard />}

          {saved && resumeKey(saved) !== dismissedResume && (
            <ContinueCard
              slug={saved.slug}
              subject={saved.subject}
              current={saved.currentIndex}
              total={saved.questions.length}
              answered={saved.answers.filter((a) => a !== null).length}
              onResume={() => resume(saved)}
              onDismiss={() => {
                lsSet(RESUME_DISMISSED_KEY, resumeKey(saved))
                setDismissedResume(resumeKey(saved))
              }}
            />
          )}

          <StatTiles history={history} mistakes={mistakesTotal} />

          <section aria-labelledby="subjects-heading" className="pt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="subjects-heading" className="text-lg font-bold tracking-[-0.01em] lg:text-xl">Subjects</h2>
              <Link
                to={ROUTES.UPLOAD}
                viewTransition={!lite}
                className="press -mr-2 inline-flex min-h-10 items-center gap-1.5 rounded-btn px-3 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg"
              >
                <Icon name="plus" size={16} strokeWidth={2.5} /> Add subject
              </Link>
            </div>
            <div className={CAROUSEL}>
              {subjectViews.map((view, i) => renderCard(view, i, false))}
              <AddSubjectCard className={CAROUSEL_ITEM} index={subjectViews.length + 5} />
            </div>
          </section>

          {quizViews.length > 0 && (
            <section aria-labelledby="quizzes-heading" className="pt-4">
              <h2 id="quizzes-heading" className="text-lg font-bold tracking-[-0.01em] lg:text-xl">Quick quizzes</h2>
              <div className={CAROUSEL}>{quizViews.map((view, i) => renderCard(view, i, true))}</div>
            </section>
          )}
        </div>

        <aside className="space-y-5" aria-label="Streak and leaderboard">
          {desktop && <StreakCard streak={streak} best={bestStreak} week={week} />}
          <LeaderboardMini board={board} />
          {desktop && <InstallCard />}
          <DevCredit />
        </aside>
      </div>

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
