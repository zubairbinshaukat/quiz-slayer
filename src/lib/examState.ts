import { EXAM_STATE_KEY_PREFIX } from './storageKeys'
import { shuffleArray } from './utils'
import { isRecord, type ExamAttempt, type ExamState, type ExamStateUpdate, type Answer, type Question, type QuestionId } from '../types'

// ─── Timed exam rules ─────────────────────────────────────────────────────────

/** Questions per timed exam (or the whole remaining pool if smaller). */
const EXAM_QUESTION_COUNT = 30
export const EXAM_SECONDS_PER_QUESTION = 90
/** Score % needed to pass. */
export const EXAM_PASS_THRESHOLD = 50

// ─── State read / write (localStorage exam-state-<slug>) ──────────────────────

function defaultExamState(): ExamState {
  return { correctIds: [], incorrectIds: [], attempts: [] }
}

function idArray(value: unknown): QuestionId[] {
  return Array.isArray(value)
    ? value.filter((v): v is QuestionId => typeof v === 'number' || typeof v === 'string')
    : []
}

/** De-duplicates ids, treating 7 and "7" as the same question. */
function uniqueIds(ids: QuestionId[]): QuestionId[] {
  return [...new Map(ids.map((id) => [String(id), id])).values()]
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

/** Tolerates older shapes (extra quiz* fields from the retired exam pages are ignored). */
function parseExamState(value: unknown): ExamState {
  if (!isRecord(value)) return defaultExamState()
  return {
    correctIds: idArray(value.correctIds),
    incorrectIds: idArray(value.incorrectIds),
    attempts: Array.isArray(value.attempts)
      ? value.attempts.map(parseAttempt).filter((a): a is ExamAttempt => a !== null)
      : [],
  }
}

export function getExamState(subjectSlug: string): ExamState {
  try {
    const raw = localStorage.getItem(EXAM_STATE_KEY_PREFIX + subjectSlug)
    return raw ? parseExamState(JSON.parse(raw) as unknown) : defaultExamState()
  } catch {
    return defaultExamState()
  }
}

/**
 * Merges one exam result into persistent state:
 * correct answers are mastered for good; wrong ones stay queued until answered correctly.
 */
function saveExamState(subjectSlug: string, updates: ExamStateUpdate): void {
  try {
    const existing = getExamState(subjectSlug)
    const correctIds = uniqueIds([...existing.correctIds, ...updates.correctIds])
    const mastered = new Set(correctIds.map(String))
    const next: ExamState = {
      correctIds,
      incorrectIds: uniqueIds([...existing.incorrectIds, ...updates.incorrectIds]).filter((id) => !mastered.has(String(id))),
      attempts: updates.attempt ? [...existing.attempts, updates.attempt] : existing.attempts,
    }
    localStorage.setItem(EXAM_STATE_KEY_PREFIX + subjectSlug, JSON.stringify(next))
  } catch {
    // localStorage full or unavailable: mastery is best-effort
  }
}

export function clearExamState(subjectSlug: string): void {
  try {
    localStorage.removeItem(EXAM_STATE_KEY_PREFIX + subjectSlug)
  } catch { /* ignore */ }
}

/** Records mastery for a submitted exam (unanswered counts as wrong). */
export function recordExamResult(subjectSlug: string, questions: Question[], answers: Answer[], score: number): void {
  const correctIds = questions.filter((q, i) => answers[i] === q.correctIndex).map((q) => q.id)
  const incorrectIds = questions.filter((q, i) => answers[i] !== q.correctIndex).map((q) => q.id)
  saveExamState(subjectSlug, {
    correctIds,
    incorrectIds,
    attempt: {
      date: new Date().toISOString(),
      score,
      correct: correctIds.length,
      total: questions.length,
      questionIds: questions.map((q) => q.id),
    },
  })
}

// ─── Adaptive selection ───────────────────────────────────────────────────────

function unmastered(questions: Question[], state: ExamState): Question[] {
  const mastered = new Set(state.correctIds.map(String))
  return questions.filter((q) => !mastered.has(String(q.id)))
}

/** Questions answered correctly in any timed exam, out of this pool. */
export function getExamMasteredCount(questions: Question[], state: ExamState): number {
  return questions.length - unmastered(questions, state).length
}

/** How many questions the next exam will have (0 = everything mastered). */
export function getExamQuestionCount(questions: Question[], state: ExamState): number {
  return Math.min(EXAM_QUESTION_COUNT, unmastered(questions, state).length)
}

/**
 * Picks up to EXAM_QUESTION_COUNT questions: mastered ids are excluded and
 * previously wrong ids are drawn first so they repeat until answered correctly.
 */
export function selectExamQuestions(questions: Question[], state: ExamState): Question[] {
  const remaining = unmastered(questions, state)
  const wrong = new Set(state.incorrectIds.map(String))
  const retry = shuffleArray(remaining.filter((q) => wrong.has(String(q.id))))
  const fresh = shuffleArray(remaining.filter((q) => !wrong.has(String(q.id))))
  return shuffleArray([...retry, ...fresh].slice(0, EXAM_QUESTION_COUNT))
}
