// ─── Shared domain types ──────────────────────────────────────────────────────

/** Question IDs are numbers in the bundled data, but uploaded JSON may use strings. */
export type QuestionId = number | string

export interface Question {
  id: QuestionId
  text: string
  options: string[]
  correctIndex: number
  shortExplanation?: string
  explanation?: string
}

/** Raw subject JSON shape (src/data/*.json and uploaded files). */
export interface SubjectData {
  subject: string
  slug: string
  description?: string
  questions: Question[]
  guess_questions?: Question[]
}

/** Custom subject as stored in IndexedDB. */
export interface CustomSubjectRecord extends SubjectData {
  isCustom?: boolean
  addedAt?: string
}

/** Subject after processing by useSubjectData. */
export interface Subject {
  subject: string
  slug: string
  description: string
  questionCount: number
  questions: Question[]
  guessQuestions: Question[]
  isGuess: boolean
  isCustom: boolean
}

/** Minimal subject identity used to start a quiz. */
export interface SubjectMeta {
  subject: string
  slug: string
}

/** A user's answer: selected option index or null if unanswered. */
export type Answer = number | null

export type QuizStatus = 'idle' | 'active' | 'completed'

/** How a quiz session was started. */
export type QuizMode = 'quiz' | 'exam' | 'retry'

export interface QuizResult {
  correct: number
  total: number
  score: number
  timeTaken: number
}

/** Quiz-in-progress snapshot stored in localStorage (quiz-progress-<slug>). */
export interface SavedProgress {
  slug: string
  subject: string
  questions: Question[]
  answers: Answer[]
  currentIndex: number
  startTime: string
  mode: QuizMode
}

/** Snapshot stored in sessionStorage (quiz-analytics) for the results pages. */
export interface AnalyticsSnapshot {
  result: QuizResult
  subject: string
  /** Absent in snapshots written by older versions. */
  slug?: string
  questions: Question[]
  answers: Answer[]
  /** Absent in snapshots written by older versions (treated as 'quiz'). */
  mode?: QuizMode
}

/** Record written to IndexedDB quiz_history (without id / dateTaken). */
export interface NewHistoryEntry {
  subject: string
  slug: string
  score: number
  correct: number
  total: number
  answers: Answer[]
  timeTaken: number
  mode?: QuizMode
  /** Absent on entries saved before these fields existed. */
  questionIds?: string[]
  wrongIds?: string[]
  optionsCount?: number
}

export interface HistoryEntry extends NewHistoryEntry {
  id: number
  dateTaken: string
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export type ExamPoolType = 'main' | 'combined' | 'main+quiz'

export interface ExamSubjectConfig {
  slug: string
  label: string
  shortLabel: string
  iconKey: string
  color: string
  /** ISO UTC unlock time, or null when always available. */
  unlockUtc: string | null
  quizSlugs: string[]
  poolType: ExamPoolType
  examName: string
  description: string
  /** Questions per exam session (30, or the whole pool if smaller). */
  questionCount: number
}

export interface ExamAttempt {
  date: string
  score: number
  correct: number
  total: number
  questionIds: QuestionId[]
}

export interface ExamState {
  correctIds: QuestionId[]
  incorrectIds: QuestionId[]
  quizCorrectIds: QuestionId[]
  quizIncorrectIds: QuestionId[]
  attempts: ExamAttempt[]
}

export interface ExamStateUpdate {
  correctIds: QuestionId[]
  incorrectIds?: QuestionId[]
  quizCorrectIds?: QuestionId[]
  quizIncorrectIds?: QuestionId[]
  attempt?: ExamAttempt
}

// ─── Type guards for JSON parsing ─────────────────────────────────────────────

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
