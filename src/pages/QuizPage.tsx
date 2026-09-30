import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExplanationPanel } from '../components/quiz/ExplanationPanel'
import { OptionButton, type OptionState } from '../components/quiz/OptionButton'
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
import { EXAM_MODE_SESSION_KEY } from '../lib/examState'
import { clearProgress, getSavedProgress } from '../lib/quizProgress'
import { usePageMeta } from '../lib/seo'
import { shuffleArray } from '../lib/utils'
import { withQuestionTransition } from '../lib/viewTransition'
import { isRecord, type SavedProgress } from '../types'

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
    if (status === 'completed') {
      const examModeRaw = sessionStorage.getItem(EXAM_MODE_SESSION_KEY)
      sessionStorage.removeItem(EXAM_MODE_SESSION_KEY)
      if (examModeRaw) {
        try {
          const examMode: unknown = JSON.parse(examModeRaw)
          const subjectSlug = isRecord(examMode) && typeof examMode.subjectSlug === 'string' ? examMode.subjectSlug : undefined
          nav(ROUTES.EXAM_RESULT, { replace: true, state: { subjectSlug } })
          return
        } catch { /* fall through to analytics */ }
      }
      nav(ROUTES.ANALYTICS, { replace: true })
    }
  }, [status, slug, nav, getSubjectBySlug, rehydrate, savedProgress])

  // New question → back to the top so the question is in view
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 })
  }, [currentIndex])

  const statuses = useMemo<QuestionStatus[]>(
    () => questions.map((q, i) => (answers[i] == null ? 'open' : answers[i] === q.correctIndex ? 'correct' : 'wrong')),
    [questions, answers],
  )

  const active = status === 'active' && questions.length > 0 && !savedProgress
  const question = active ? questions[currentIndex] : null
  const currentAnswer = answers[currentIndex] ?? null
  const isLast = currentIndex === questions.length - 1
  const answeredCount = statuses.filter((s) => s !== 'open').length

  function goTo(index: number) {
    if (index === currentIndex || index < 0 || index >= questions.length) return
    withQuestionTransition(index > currentIndex ? 'next' : 'prev', () => goToQuestion(index))
  }

  function select(i: number) {
    if (!question || currentAnswer !== null) return
    answerQuestion(currentIndex, i)
    playSound(i === question.correctIndex ? 'Correct' : 'Incorrect')
  }

  function requestSubmit(forceConfirm: boolean) {
    if (forceConfirm || answeredCount < questions.length) setConfirmOpen(true)
    else submitQuiz()
  }

  function next() {
    if (currentAnswer === null) return
    if (isLast) requestSubmit(true)
    else goTo(currentIndex + 1)
  }

  function toggleMore() {
    if (currentAnswer === null || !question?.explanation) return
    setExpanded((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))
  }

  useQuizKeyboard(
    {
      optionCount: question?.options.length ?? 0,
      answered: currentAnswer !== null,
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

  function optionState(i: number): OptionState {
    if (currentAnswer === null || !question) return 'idle'
    if (i === question.correctIndex) return 'correct'
    return i === currentAnswer ? 'wrong' : 'dim'
  }

  return (
    <>
      <QuizHeader
        subject={subject ?? ''}
        mode={mode}
        exitTo={mode === 'exam' ? ROUTES.EXAM : ROUTES.HOME}
        current={currentIndex}
        statuses={statuses}
        startTime={startTime}
        onHelp={() => setHelpOpen(true)}
      />

      <main id="main" className="mx-auto w-full max-w-[640px] px-4 pt-5 pb-[calc(112px+env(safe-area-inset-bottom))]">
        <section className="vt-question" aria-labelledby="question-text">
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted">Question {currentIndex + 1}</p>
          <h1 id="question-text" className="mt-2 text-[19px] font-semibold leading-snug tracking-[-0.01em] sm:text-[21px]">
            {question.text}
          </h1>

          <div role="group" aria-label="Answer options" className="mt-5 space-y-2.5">
            {question.options.map((option, i) => (
              <OptionButton
                key={i}
                option={option}
                index={i}
                state={optionState(i)}
                locked={currentAnswer !== null}
                flash={flash.index === i ? flash.n : 0}
                onSelect={() => select(i)}
              />
            ))}
          </div>

          {currentAnswer !== null && (
            <ExplanationPanel
              key={currentIndex}
              question={question}
              isCorrect={currentAnswer === question.correctIndex}
              expanded={!!expanded[currentIndex]}
              onToggle={toggleMore}
            />
          )}
        </section>

        {questions.length > 1 && <QuestionPalette statuses={statuses} current={currentIndex} onJump={goTo} />}
      </main>

      <QuizBottomBar
        canPrev={currentIndex > 0}
        canAdvance={currentAnswer !== null}
        isLast={isLast}
        onPrev={() => goTo(currentIndex - 1)}
        onNext={next}
        onSubmit={() => requestSubmit(false)}
      />

      <ShortcutsSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SubmitSheet
        open={confirmOpen}
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
