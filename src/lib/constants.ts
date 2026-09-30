import type { Icon3DName } from './icons3d'

export const ROUTES = {
  HOME: '/',
  QUIZ: '/quiz/:slug',
  QUIZ_PATH: (slug: string) => `/quiz/${slug}`,
  ANALYTICS: '/analytics',
  HISTORY: '/history',
  LEADERBOARD: '/leaderboard',
  UPLOAD: '/upload',
  EXAM: '/exam',
  EXAM_RESULT: '/exam/result',
}

export const SITE_URL = 'https://quiz.zubyr.dev'
export const SITE_NAME = 'Quiz Slayer'
export const DEFAULT_TITLE = 'Quiz Slayer — Slay your midterms'
export const DEFAULT_DESCRIPTION =
  'Quiz Slayer: fast, offline-ready MCQ practice for your university subjects. Mock exams, mistake retries, streaks and a leaderboard.'

export const DB_NAME = 'quiz-practice-db'
export const DB_VERSION = 2
export const DB_STORE = 'quiz_history'
export const CUSTOM_SUBJECTS_STORE = 'custom_subjects'

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export const THEME_KEY = 'quiz-theme'
export const SESSION_KEY = 'quiz-session'
export const PROGRESS_KEY_PREFIX = 'quiz-progress-'

// ─── Grades ──────────────────────────────────────────────────────────────────

export type Tone = 'success' | 'info' | 'accent' | 'danger'

export interface Grade {
  min: number
  label: string
  tone: Tone
  icon: Icon3DName
}

export const GRADE_MAP: Grade[] = [
  { min: 90, label: 'Excellent', tone: 'success', icon: 'trophy' },
  { min: 75, label: 'Great', tone: 'info', icon: 'medal' },
  { min: 60, label: 'Good', tone: 'accent', icon: 'star' },
  { min: 40, label: 'Fair', tone: 'accent', icon: 'thumb-up' },
  { min: 0, label: 'Needs work', tone: 'danger', icon: 'target' },
]

export function getGrade(score: number): Grade {
  return GRADE_MAP.find((g) => score >= g.min) ?? GRADE_MAP[GRADE_MAP.length - 1]
}

/** Text colour per tone (full class strings so Tailwind keeps them). */
export const TONE_TEXT: Record<Tone, string> = {
  success: 'text-success',
  info: 'text-info',
  accent: 'text-accent-fg',
  danger: 'text-danger',
}

/** Soft pill background + text per tone. */
export const TONE_SOFT: Record<Tone, string> = {
  success: 'bg-success/12 text-success',
  info: 'bg-info/12 text-info',
  accent: 'bg-accent/15 text-accent-fg',
  danger: 'bg-danger/12 text-danger',
}

// ─── Exam constants ───────────────────────────────────────────────────────────
export const EXAM_STATE_KEY_PREFIX = 'exam-state-'
export const EXAM_MODE_SESSION_KEY = 'exam-mode'
export const EXAM_PASS_THRESHOLD = 50
