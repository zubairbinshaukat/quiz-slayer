import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { QuestionPalette } from '../components/quiz/QuestionPalette'
import { QuizBottomBar } from '../components/quiz/QuizBottomBar'
import { QuizHeader } from '../components/quiz/QuizHeader'
import { ResumeSheet, ShortcutsSheet, SubmitSheet } from '../components/quiz/QuizSheets'
import type { QuestionStatus } from '../components/quiz/SegmentedProgress'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useQuizKeyboard } from '../hooks/useQuizKeyboard'
import { useSound } from '../hooks/useSound'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import { EXAM_SECONDS_PER_QUESTION } from '../lib/examState'
import { clearProgress, getSavedProgress } from '../lib/quizProgress'
import { usePageMeta } from '../lib/seo'
import { shuffleArray } from '../lib/utils'
import { withQuestionTransition } from '../lib/viewTransition'
import type { SavedProgress } from '../types'

export function QuizPage() {
  const { slug } = useParams()
  const nav = useNav()
  const {
    status, subject, questions, answers, currentIndex, startTime, mode,
    answerQuestion, goToQuestion, submitQuiz, rehydrate, rehydrateFromProgress,
  } = useQuiz()
  const { getSubjectBySlug } = useSubjectData()
  const { playSound } = useSound()
  usePageMeta({ title: subject ? `${subject} quiz` : 'Quiz', path: ROUTES.QUIZ_PATH(slug ?? '') })

  // Saved progress (localStorage) offered for resume when landing here without an active quiz
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(() => {
    if (status !== 'idle' || !slug) return null
    const saved = getSavedProgress(slug)
    return saved && saved.answers.some((a) => a !== null) ? saved : null
  })
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [helpOpen, setHelpOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [flash, setFlash] = useState({ index: -1, n: 0 })

  // Re-hydrate after a refresh; route to results once submitted
  useEffect(() => {
    if (status === 'idle') {
      const subjectData = getSubjectBySlug(slug)
      if (!subjectData) {
        nav('/', { replace: true })
        return
      }
      if (savedProgress) return // waiting for Resume / Start fresh
      rehydrate(subjectData, shuffleArray(subjectData.questions))
    }
    if (status === 'completed') nav(ROUTES.ANALYTICS, { replace: true })
  }, [status, slug, nav, getSubjectBySlug, rehydrate, savedProgress])

  // New question → back to the top so the question is in view
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 })
  }, [currentIndex])

  // Timed exam: answers stay hidden until submit, so progress only shows answered / open
  const exam = mode === 'exam'
  const statuses = useMemo<QuestionStatus[]>(
    () =>
      questions.map((q, i) =>
        answers[i] == null ? 'open' : exam ? 'answered' : answers[i] === q.correctIndex ? 'correct' : 'wrong',
      ),
    [questions, answers, exam],
  )
  const deadline = exam && startTime ? startTime.getTime() + questions.length * EXAM_SECONDS_PER_QUESTION * 1000 : null

  const active = status === 'active' && questions.length > 0 && !savedProgress
  const question = active ? questions[currentIndex] : null
  const currentAnswer = answers[currentIndex] ?? null
  const isLast = currentIndex === questions.length - 1
  const answeredCount = statuses.filter((s) => s !== 'open').length
  // Practice locks after the first pick; exams allow skipping and changing answers
  const locked = !exam && currentAnswer !== null
  const canAdvance = exam || currentAnswer !== null

  function goTo(index: number) {
    if (index === currentIndex || index < 0 || index >= questions.length) return
    withQuestionTransition(index > currentIndex ? 'next' : 'prev', () => goToQuestion(index))
  }

  function select(i: number) {
    if (!question || locked) return
    answerQuestion(currentIndex, i)
    if (!exam) playSound(i === question.correctIndex ? 'Correct' : 'Incorrect')
  }

  function requestSubmit(forceConfirm: boolean) {
    if (forceConfirm || answeredCount < questions.length) setConfirmOpen(true)
    else submitQuiz()
  }

  function next() {
    if (!canAdvance) return
    if (isLast) requestSubmit(true)
    else goTo(currentIndex + 1)
  }

  function toggleMore() {
    if (exam || currentAnswer === null || !question?.explanation) return
    setExpanded((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))
  }

  useQuizKeyboard(
    {
      optionCount: question?.options.length ?? 0,
      answered: locked,
      onSelect: (i) => {
        setFlash((f) => ({ index: i, n: f.n + 1 }))
        select(i)
      },
      onNext: next,
      onPrev: () => goTo(currentIndex - 1),
      onSubmit: () => requestSubmit(true),
      onToggleMore: toggleMore,
      onHelp: () => setHelpOpen(true),
    },
    active,
  )

  if (savedProgress) {
    return (
      <main id="main" className="min-h-dvh">
        <ResumeSheet
          open
          answered={savedProgress.answers.filter((a) => a !== null).length}
          total={savedProgress.questions.length}
          onResume={() => {
            rehydrateFromProgress(savedProgress)
            setSavedProgress(null)
          }}
          onStartFresh={() => {
            if (slug) clearProgress(slug)
            const subjectData = getSubjectBySlug(slug)
            if (subjectData) rehydrate(subjectData, shuffleArray(subjectData.questions))
            setSavedProgress(null)
          }}
        />
      </main>
    )
  }

  if (!question) return <main id="main" className="min-h-dvh" aria-busy="true" />

  return (
    <>
      <QuizHeader
        subject={subject ?? ''}
        mode={mode}
        exitTo={ROUTES.HOME}
        current={currentIndex}
        statuses={statuses}
        startTime={startTime}
        deadline={deadline}
        onExpire={submitQuiz}
        onHelp={() => setHelpOpen(true)}
      />

      <main id="main" className="mx-auto w-full max-w-[640px] px-4 pt-5 pb-[calc(112px+env(safe-area-inset-bottom))]">
        <QuestionCard
          question={question}
          index={currentIndex}
          answer={currentAnswer}
          exam={exam}
          expanded={!!expanded[currentIndex]}
          flash={flash}
          onSelect={select}
          onToggleMore={toggleMore}
        />

        {questions.length > 1 && <QuestionPalette statuses={statuses} current={currentIndex} onJump={goTo} />}
      </main>

      <QuizBottomBar
        canPrev={currentIndex > 0}
        canAdvance={canAdvance}
        isLast={isLast}
        onPrev={() => goTo(currentIndex - 1)}
        onNext={next}
        onSubmit={() => requestSubmit(false)}
      />

      <ShortcutsSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SubmitSheet
        open={confirmOpen}
        exam={exam}
        answered={answeredCount}
        total={questions.length}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          submitQuiz()
        }}
      />
    </>
  )
}
