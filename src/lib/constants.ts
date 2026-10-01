import type { Icon3DName } from './icons3d'

export const ROUTES = {
  HOME: '/',
  QUIZ: '/quiz/:slug',
  QUIZ_PATH: (slug: string) => `/quiz/${slug}`,
  ANALYTICS: '/analytics',
  HISTORY: '/history',
  LEADERBOARD: '/leaderboard',
  UPLOAD: '/upload',
}

export const SITE_URL = 'https://quiz.zubyr.dev'
export const SITE_NAME = 'Quiz Slayer'
export const DEFAULT_TITLE = 'Quiz Slayer — Slay your midterms'
export const DEFAULT_DESCRIPTION =
  'Quiz Slayer: fast, offline-ready MCQ practice for your university subjects. Mock exams, mistake retries, streaks and a leaderboard.'

// Storage keys and IndexedDB names live in ./storageKeys.

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

// ─── Grades ──────────────────────────────────────────────────────────────────

export type Tone = 'success' | 'info' | 'accent' | 'danger'

export interface Grade {
  min: number
  label: string
  tone: Tone
  icon: Icon3DName
}

const GRADE_MAP: Grade[] = [
  { min: 90, label: 'Excellent', tone: 'success', icon: 'trophy' },
  { min: 75, label: 'Great', tone: 'info', icon: 'medal' },
  { min: 60, label: 'Good', tone: 'accent', icon: 'star' },
  { min: 40, label: 'Fair', tone: 'accent', icon: 'thumb-up' },
  { min: 0, label: 'Needs work', tone: 'danger', icon: 'target' },
]

export function getGrade(score: number): Grade {
  return GRADE_MAP.find((g) => score >= g.min) ?? GRADE_MAP[GRADE_MAP.length - 1]
}

/** Results colour band (spec §6): mint ≥ 80, amber 50–79, coral < 50. */
export function resultTone(score: number): Exclude<Tone, 'info'> {
  return score >= 80 ? 'success' : score >= 50 ? 'accent' : 'danger'
}

/** Fixed hex per band for exported images (theme-independent). */
export const RESULT_HEX: Record<Exclude<Tone, 'info'>, string> = {
  success: '#3DDC97',
  accent: '#F5B73A',
  danger: '#FF6B5E',
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
