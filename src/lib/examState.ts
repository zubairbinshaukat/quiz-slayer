import type {
  ExamAttempt,
  ExamState,
  ExamStateUpdate,
  ExamSubjectConfig,
  Question,
  Subject,
} from '../types'
import { isRecord } from '../types'
import { getSubjectIcon } from './subjectUtils'
import { EXAM_MODE_SESSION_KEY, EXAM_PASS_THRESHOLD, EXAM_STATE_KEY_PREFIX } from './constants'

export { EXAM_MODE_SESSION_KEY, EXAM_PASS_THRESHOLD, EXAM_STATE_KEY_PREFIX }

// ─── Exam Subject Config ─────────────────────────────────────────────────────

export const EXAM_QUESTION_COUNT = 30

/** Map of quiz slug → quiz data (used by the 'main+quiz' pool type). */
export type QuizDataMap = Record<string, Pick<Subject, 'questions'> | null>

function shortLabelFor(label: string): string {
  const initials = label
    .split(/[\s&-]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return initials.slice(0, 4) || label.slice(0, 3).toUpperCase()
}

/**
 * Every loaded subject gets an exam card. No lock time; each session draws
 * EXAM_QUESTION_COUNT questions (or the whole pool if smaller).
 */
export function buildExamSubject(subject: Subject): ExamSubjectConfig {
  const questionCount = Math.min(EXAM_QUESTION_COUNT, subject.questions.length)
  return {
    slug: subject.slug,
    label: subject.subject,
    shortLabel: shortLabelFor(subject.subject),
    iconKey: getSubjectIcon(subject.slug),
    unlockUtc: null,
    quizSlugs: [],
    poolType: 'main',
    examName: `${subject.subject} Exam`,
    description: `${questionCount} MCQs drawn from the full question bank`,
    questionCount,
  }
}

export function buildExamSubjects(subjects: Subject[]): ExamSubjectConfig[] {
  return subjects.filter((s) => s.questions.length > 0).map(buildExamSubject)
}

// ─── Default State ────────────────────────────────────────────────────────────

function defaultExamState(): ExamState {
  return {
    correctIds: [],
    incorrectIds: [],
    quizCorrectIds: [],
    quizIncorrectIds: [],
    attempts: [],
  }
}

function idArray(value: unknown): (number | string)[] {
  return Array.isArray(value)
    ? value.filter((v): v is number | string => typeof v === 'number' || typeof v === 'string')
    : []
}

function parseAttempt(value: unknown): ExamAttempt | null {
  if (!isRecord(value)) return null
  const { date, score, correct, total, questionIds } = value
  if (typeof score !== 'number') return null
  return {
    date: typeof date === 'string' ? date : '',
    score,
    correct: typeof correct === 'number' ? correct : 0,
    total: typeof total === 'number' ? total : 0,
    questionIds: idArray(questionIds),
  }
}

function parseExamState(value: unknown): ExamState {
  if (!isRecord(value)) return defaultExamState()
  return {
    correctIds: idArray(value.correctIds),
    incorrectIds: idArray(value.incorrectIds),
    quizCorrectIds: idArray(value.quizCorrectIds),
    quizIncorrectIds: idArray(value.quizIncorrectIds),
    attempts: Array.isArray(value.attempts)
      ? value.attempts.map(parseAttempt).filter((a): a is ExamAttempt => a !== null)
      : [],
  }
}

// ─── State Read / Write ───────────────────────────────────────────────────────

export function getExamState(subjectSlug: string): ExamState {
  try {
    const raw = localStorage.getItem(EXAM_STATE_KEY_PREFIX + subjectSlug)
    return raw ? parseExamState(JSON.parse(raw) as unknown) : defaultExamState()
  } catch {
    return defaultExamState()
  }
}

/** Saves exam result into persistent state. */
export function saveExamState(subjectSlug: string, updates: ExamStateUpdate): void {
  try {
    const existing = getExamState(subjectSlug)

    // correctIds is cumulative (Set union — never remove a mastered question)
    const correctIdSet = new Set([...existing.correctIds, ...updates.correctIds])

    // quizCorrectIds is also cumulative
    const quizCorrectIdSet = new Set([...existing.quizCorrectIds, ...(updates.quizCorrectIds ?? [])])

    // incorrectIds is overwritten each attempt (these are what repeats next time)
    const incorrectIds = updates.incorrectIds ?? []

    // quizIncorrectIds overwritten too
    const quizIncorrectIds = updates.quizIncorrectIds ?? []

    const newState: ExamState = {
      correctIds: [...correctIdSet],
      incorrectIds,
      quizCorrectIds: [...quizCorrectIdSet],
      quizIncorrectIds,
      attempts: updates.attempt
        ? [...existing.attempts, updates.attempt]
        : existing.attempts,
    }

    localStorage.setItem(EXAM_STATE_KEY_PREFIX + subjectSlug, JSON.stringify(newState))
  } catch {
    // localStorage full — silently fail, same pattern as QuizContext
  }
}

export function clearExamState(subjectSlug: string): void {
  try {
    localStorage.removeItem(EXAM_STATE_KEY_PREFIX + subjectSlug)
  } catch { /* ignore */ }
}

// ─── Unlock Status ────────────────────────────────────────────────────────────

/** A null unlock time means the exam is always available. */
export function getUnlockStatus(unlockUtcString: string | null): { isUnlocked: boolean; secondsRemaining: number } {
  if (!unlockUtcString) return { isUnlocked: true, secondsRemaining: 0 }
  const unlockTime = new Date(unlockUtcString).getTime()
  const now = Date.now()
  if (now >= unlockTime) return { isUnlocked: true, secondsRemaining: 0 }
  return { isUnlocked: false, secondsRemaining: Math.ceil((unlockTime - now) / 1000) }
}

/**
 * Smart time-left label:
 *  ≥ 2 days  → "2 days left"
 *  1 day     → "1 day left"
 *  ≥ 2 hours → "5 hours left"
 *  1 hour    → "1 hour left"
 *  < 1 hour  → live HH:MM:SS (no T- prefix)
 */
export function formatTimeLeft(totalSeconds: number): string | null {
  if (totalSeconds <= 0) return null
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (days >= 2) return `${days} days left`
  if (days === 1) return '1 day left'
  if (hours >= 2) return `${hours} hours left`
  if (hours === 1) return '1 hour left'
  // Under 1 hour — live countdown without T- prefix
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ─── Shuffle (local copy to keep this file self-contained) ────────────────────

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Question Selection ───────────────────────────────────────────────────────

/**
 * Selects the exam question pool based on subject config, subject data, quiz data map, and prior exam state.
 * Returns at most EXAM_QUESTION_COUNT questions (empty when everything is mastered).
 */
export function selectExamQuestions(
  config: ExamSubjectConfig,
  subjectData: Pick<Subject, 'questions' | 'guessQuestions'>,
  quizDataMap: QuizDataMap,
  examState: ExamState,
): Question[] {
  const isInitial = examState.attempts.length === 0
  const max = EXAM_QUESTION_COUNT

  // ── Combined: questions + guessQuestions ─────────────────────────────────
  if (config.poolType === 'combined') {
    const fullPool = [...subjectData.questions, ...subjectData.guessQuestions]
    if (isInitial) {
      return shuffle(fullPool).slice(0, max)
    }
    const remaining = fullPool.filter((q) => !examState.correctIds.includes(q.id))
    if (remaining.length === 0) return [] // all mastered
    return shuffle(remaining).slice(0, Math.min(max, remaining.length))
  }

  // ── Quiz files + main subject ────────────────────────────────────────────
  if (config.poolType === 'main+quiz') {
    const quiz1Questions = quizDataMap[config.quizSlugs[0]]?.questions ?? []
    const quiz2Questions = quizDataMap[config.quizSlugs[1]]?.questions ?? []
    const allQuizQuestions = [...quiz1Questions, ...quiz2Questions]
    const mainQuestions = subjectData.questions

    if (isInitial) {
      const from1 = shuffle(quiz1Questions).slice(0, 5)
      const from2 = shuffle(quiz2Questions).slice(0, 5)
      const fromMain = shuffle(mainQuestions).slice(0, 20)
      return [...from1, ...from2, ...fromMain]
    }

    // Retest
    const remainingQuiz = allQuizQuestions.filter(
      (q) => !examState.quizCorrectIds.includes(q.id)
    )

    if (remainingQuiz.length === 0) {
      // All quiz questions mastered — take entirely from main
      const remaining = mainQuestions.filter((q) => !examState.correctIds.includes(q.id))
      if (remaining.length === 0) return []
      return shuffle(remaining).slice(0, Math.min(max, remaining.length))
    }

    const fromQuiz = shuffle(remainingQuiz).slice(0, Math.min(10, remainingQuiz.length))
    const remainingMain = mainQuestions.filter((q) => !examState.correctIds.includes(q.id))
    const fillCount = Math.max(0, max - fromQuiz.length)
    const fromMain = shuffle(remainingMain).slice(0, Math.min(fillCount, remainingMain.length))
    return [...fromQuiz, ...fromMain]
  }

  // ── Default: main questions only ─────────────────────────────────────────
  const mainQuestions = subjectData.questions
  if (isInitial) {
    return shuffle(mainQuestions).slice(0, Math.min(max, mainQuestions.length))
  }
  const remaining = mainQuestions.filter((q) => !examState.correctIds.includes(q.id))
  if (remaining.length === 0) return []
  return shuffle(remaining).slice(0, Math.min(max, remaining.length))
}

/** Returns the total pool size for a subject (used for progress bar). */
export function getTotalPoolSize(
  config: ExamSubjectConfig,
  subjectData: Pick<Subject, 'questions' | 'guessQuestions'>,
  quizDataMap: QuizDataMap,
): number {
  if (config.poolType === 'combined') {
    return subjectData.questions.length + subjectData.guessQuestions.length
  }
  if (config.poolType === 'main+quiz') {
    const q1 = quizDataMap[config.quizSlugs[0]]?.questions.length ?? 0
    const q2 = quizDataMap[config.quizSlugs[1]]?.questions.length ?? 0
    return q1 + q2 + subjectData.questions.length
  }
  return subjectData.questions.length
}

/** Get the best score from attempt history. */
export function getBestScore(attempts: ExamAttempt[]): number | null {
  if (!attempts.length) return null
  return Math.max(...attempts.map((a) => a.score))
}
