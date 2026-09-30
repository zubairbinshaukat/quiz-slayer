import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { SESSION_KEY } from '../lib/constants'
import { saveQuizResult } from '../lib/db'
import { recordAttempt } from '../lib/attemptSink'
import { getDeviceId } from '../lib/deviceId'
import { clearProgress, writeProgress } from '../lib/quizProgress'
import { getOptionsCount, getWrongQuestions } from '../lib/quizStats'
import { shuffleArray } from '../lib/utils'
import { isRecord, type AnalyticsSnapshot, type Answer, type Question, type QuizMode, type SavedProgress, type SubjectMeta } from '../types'
import { ANALYTICS_KEY, readAnalyticsSnapshot } from '../lib/analyticsSnapshot'
import { QuizContext, type QuizState } from './quizContextDef'

const INITIAL_STATE: QuizState = {
  subject: null,
  slug: null,
  questions: [],
  answers: [],
  currentIndex: 0,
  startTime: null,
  status: 'idle',
  result: null,
  mode: 'quiz',
}

/* ─── Progress helpers (localStorage) ─────────────────────────── */
function saveProgress(state: QuizState): void {
  if (state.status !== 'active' || !state.slug) return
  writeProgress({
    slug: state.slug,
    subject: state.subject ?? '',
    questions: state.questions,
    answers: state.answers,
    currentIndex: state.currentIndex,
    startTime: (state.startTime ?? new Date()).toISOString(),
    mode: state.mode,
  })
}

function readSessionStartTime(): Date | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (isRecord(parsed) && typeof parsed.startTime === 'string') {
      return new Date(parsed.startTime)
    }
  } catch { /* ignore malformed session */ }
  return null
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>(INITIAL_STATE)

  /** Start a new quiz session */
  const startQuiz = useCallback((subjectMeta: SubjectMeta, questions: Question[], mode: QuizMode = 'quiz') => {
    const startTime = new Date()
    setState({
      subject: subjectMeta.subject,
      slug: subjectMeta.slug,
      questions,
      answers: new Array<null>(questions.length).fill(null),
      currentIndex: 0,
      startTime,
      status: 'active',
      result: null,
      mode,
    })
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ slug: subjectMeta.slug, startTime: startTime.toISOString() })
    )
    // Clear any previous analytics snapshot so stale data doesn't bleed through
    sessionStorage.removeItem(ANALYTICS_KEY)
  }, [])

  /** Start a new quiz with only the wrong questions of the completed quiz */
  const startRetry = useCallback((): number => {
    let slug: string | null = null
    let subject = ''
    let questions: Question[] = []
    let answers: Answer[] = []
    if (state.status === 'completed' && state.slug) {
      slug = state.slug
      subject = state.subject ?? ''
      questions = state.questions
      answers = state.answers
    } else {
      const snap = readAnalyticsSnapshot()
      if (snap?.slug) {
        slug = snap.slug
        subject = snap.subject
        questions = snap.questions
        answers = snap.answers
      }
    }
    if (!slug) return 0
    const wrong = getWrongQuestions(questions, answers)
    if (wrong.length === 0) return 0
    startQuiz({ subject, slug }, shuffleArray(wrong), 'retry')
    return wrong.length
  }, [state, startQuiz])

  /** Record user's answer for a question index */
  const answerQuestion = useCallback((questionIndex: number, optionIndex: number) => {
    setState((prev) => {
      const answers = [...prev.answers]
      answers[questionIndex] = optionIndex
      const next = { ...prev, answers }
      saveProgress(next)
      return next
    })
  }, [])

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => {
      const next = { ...prev, currentIndex: index }
      saveProgress(next)
      return next
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    }))
  }, [])

  const prevQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }))
  }, [])

  /** Calculate result and persist to IndexedDB */
  const submitQuiz = useCallback(() => {
    // didSave guards against StrictMode double-invoking the setState updater
    let didSave = false
    let analyticsSnapshot: AnalyticsSnapshot | null = null

    setState((prev) => {
      if (prev.status !== 'active') return prev

      const correct = prev.questions.reduce((acc, q, i) => {
        return acc + (prev.answers[i] === q.correctIndex ? 1 : 0)
      }, 0)
      const total = prev.questions.length
      const score = Math.round((correct / total) * 100)
      const startMs = prev.startTime ? prev.startTime.getTime() : Date.now()
      const timeTaken = Math.round((Date.now() - startMs) / 1000)

      const result = { correct, total, score, timeTaken }

      // Capture snapshot for sessionStorage (runs outside setState below)
      analyticsSnapshot = {
        result,
        subject: prev.subject ?? '',
        questions: prev.questions,
        answers: prev.answers,
        slug: prev.slug ?? undefined,
        mode: prev.mode,
      }

      // Guard prevents double-saving in StrictMode (updater is called twice but
      // didSave persists in the closure across both invocations)
      if (!didSave) {
        didSave = true
        void saveQuizResult({
          subject: prev.subject ?? '',
          slug: prev.slug ?? '',
          score,
          correct,
          total,
          answers: prev.answers,
          timeTaken,
          mode: prev.mode,
          questionIds: prev.questions.map((q) => String(q.id)),
          wrongIds: getWrongQuestions(prev.questions, prev.answers).map((q) => String(q.id)),
          optionsCount: getOptionsCount(prev.questions),
        }).then((saved) => {
          if (saved) recordAttempt({ ...saved, deviceId: getDeviceId() })
        })
      }

      sessionStorage.removeItem(SESSION_KEY)
      if (prev.slug) clearProgress(prev.slug)
      return { ...prev, status: 'completed', result }
    })

    // Persist analytics data so the page survives navigation and refresh
    if (analyticsSnapshot) {
      sessionStorage.setItem(ANALYTICS_KEY, JSON.stringify(analyticsSnapshot))
    }
  }, [])

  const resetQuiz = useCallback(() => {
    setState((prev) => {
      if (prev.slug) clearProgress(prev.slug)
      return INITIAL_STATE
    })
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(ANALYTICS_KEY)
  }, [])

  /** Re-hydrate from subject data after page refresh on /quiz/:slug */
  const rehydrate = useCallback((subjectMeta: SubjectMeta, questions: Question[]) => {
    const startTime = readSessionStartTime() ?? new Date()

    setState({
      subject: subjectMeta.subject,
      slug: subjectMeta.slug,
      questions,
      answers: new Array<null>(questions.length).fill(null),
      currentIndex: 0,
      startTime,
      status: 'active',
      result: null,
      mode: 'quiz',
    })
  }, [])

  /** Re-hydrate from saved localStorage progress */
  const rehydrateFromProgress = useCallback((saved: SavedProgress) => {
    setState({
      subject: saved.subject,
      slug: saved.slug,
      questions: saved.questions,
      answers: saved.answers,
      currentIndex: saved.currentIndex,
      startTime: new Date(saved.startTime),
      status: 'active',
      result: null,
      mode: saved.mode,
    })
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ slug: saved.slug, startTime: saved.startTime })
    )
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      startQuiz,
      startRetry,
      answerQuestion,
      goToQuestion,
      nextQuestion,
      prevQuestion,
      submitQuiz,
      resetQuiz,
      rehydrate,
      rehydrateFromProgress,
    }),
    [
      state,
      startQuiz,
      startRetry,
      answerQuestion,
      goToQuestion,
      nextQuestion,
      prevQuestion,
      submitQuiz,
      resetQuiz,
      rehydrate,
      rehydrateFromProgress,
    ],
  )

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}
