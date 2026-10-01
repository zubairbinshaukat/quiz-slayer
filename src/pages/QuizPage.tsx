import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FeedbackSheet, ShowFeedbackButton } from '../components/quiz/Feedback'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { QuizBody } from '../components/quiz/QuizBody'
import { QuizBottomBar, QuizNavRow } from '../components/quiz/QuizBottomBar'
import { QuizHeader } from '../components/quiz/QuizHeader'
import type { QuestionStatus } from '../components/quiz/QuizProgress'
import { ResumeSheet, ShortcutsSheet, SubmitSheet } from '../components/quiz/QuizSheets'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useQuizKeyboard } from '../hooks/useQuizKeyboard'
import { useSound } from '../hooks/useSound'
import { useSubjectData } from '../hooks/useSubjectData'
import { ROUTES } from '../lib/constants'
import { EXAM_SECONDS_PER_QUESTION } from '../lib/examState'
import { haptic } from '../lib/haptics'
import { addXp, XP_PER_CORRECT } from '../lib/xp'
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
  // Question answered in this view (drives the one-time shake / "+10 XP" pop) and the mobile wrong-answer sheet
  const [freshIndex, setFreshIndex] = useState(-1)
  const [explainIndex, setExplainIndex] = useState(-1)
  const mobile = useMediaQuery('(max-width: 767px)')

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
    setFreshIndex(-1) // coming back to an answered question must not replay the shake / XP pop
    withQuestionTransition(index > currentIndex ? 'next' : 'prev', () => goToQuestion(index))
  }

  // Synchronous reveal: the state update, haptic and sound all fire in the same tick (no delay, no queue)
  function select(i: number) {
    if (!question || locked) return
    answerQuestion(currentIndex, i)
    if (exam) {
      haptic('tap')
      return
    }
    const correct = i === question.correctIndex
    setFreshIndex(currentIndex)
    haptic(correct ? 'correct' : 'wrong')
    playSound(correct ? 'Correct' : 'Incorrect')
    if (correct) addXp(XP_PER_CORRECT)
    if (mobile) setExplainIndex(currentIndex)
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
    if (exam || currentAnswer === null || !question) return
    setExpanded((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))
  }

  const tap = (fn: () => void) => () => {
    haptic('tap')
    fn()
  }
  const goPrev = tap(() => goTo(currentIndex - 1))
  const goNext = tap(next)

  useQuizKeyboard(
    {
      optionCount: question?.options.length ?? 0,
      answered: locked,
      onSelect: (i) => {
        setFlash((f) => ({ index: i, n: f.n + 1 }))
        select(i)
      },
      onNext: goNext,
      onPrev: goPrev,
      onSubmit: () => requestSubmit(true),
      onToggleMore: tap(toggleMore),
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

  const navProps = {
    canPrev: currentIndex > 0,
    canAdvance,
    isLast,
    onPrev: goPrev,
    onNext: goNext,
    onSubmit: () => requestSubmit(false),
  }

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

      <QuizBody statuses={statuses} current={currentIndex} onJump={goTo} onHelp={() => setHelpOpen(true)}>
        <QuestionCard
          question={question}
          index={currentIndex}
          total={questions.length}
          subject={subject ?? ''}
          slug={slug ?? ''}
          answer={currentAnswer}
          exam={exam}
          expanded={!!expanded[currentIndex]}
          flash={flash}
          fresh={freshIndex === currentIndex}
          onSelect={select}
          onToggleMore={toggleMore}
          footer={<QuizNavRow {...navProps} />}
        />
        {mobile && !exam && currentAnswer !== null && explainIndex !== currentIndex && (
          <ShowFeedbackButton onClick={() => setExplainIndex(currentIndex)} />
        )}
      </QuizBody>

      <QuizBottomBar {...navProps} />

      {!exam && currentAnswer !== null && (
        <FeedbackSheet
          key={currentIndex}
          open={mobile && explainIndex === currentIndex}
          question={question}
          correct={currentAnswer === question.correctIndex}
          expanded={!!expanded[currentIndex]}
          onToggle={toggleMore}
          isLast={isLast}
          onClose={() => setExplainIndex(-1)}
          onNext={() => {
            setExplainIndex(-1)
            // "See results" goes straight there once everything is answered (no extra confirm)
            if (isLast) tap(() => requestSubmit(false))()
            else goNext()
          }}
        />
      )}
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
