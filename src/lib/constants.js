export const ROUTES = {
  HOME: '/',
  QUIZ: '/quiz/:slug',
  QUIZ_PATH: (slug) => `/quiz/${slug}`,
  ANALYTICS: '/analytics',
  HISTORY: '/history',
  EXAM: '/exam',
  EXAM_RESULT: '/exam/result',
}

export const DB_NAME = 'quiz-practice-db'
export const DB_VERSION = 2
export const DB_STORE = 'quiz_history'
export const CUSTOM_SUBJECTS_STORE = 'custom_subjects'

export const THEME_KEY = 'quiz-theme'
export const SESSION_KEY = 'quiz-session'
export const PROGRESS_KEY_PREFIX = 'quiz-progress-'

/**
 * Maps subject color tokens (from JSON) to full Tailwind class strings.
 * Full strings are required so Tailwind's content scanner doesn't purge them.
 */
export const COLOR_MAP = {
  indigo: {
    gradient: 'from-indigo-100 to-violet-100',
    gradientDark: 'dark:from-indigo-950 dark:to-violet-950',
    border: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800',
    text: 'text-indigo-600',
    textDark: 'dark:text-indigo-400',
    badge: 'bg-indigo-100',
    badgeDark: 'dark:bg-indigo-900',
    dot: 'bg-indigo-500',
  },
  emerald: {
    gradient: 'from-emerald-100 to-teal-100',
    gradientDark: 'dark:from-emerald-950 dark:to-teal-950',
    border: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800',
    text: 'text-emerald-600',
    textDark: 'dark:text-emerald-400',
    badge: 'bg-emerald-100',
    badgeDark: 'dark:bg-emerald-900',
    dot: 'bg-emerald-500',
  },
  rose: {
    gradient: 'from-rose-100 to-pink-100',
    gradientDark: 'dark:from-rose-950 dark:to-pink-950',
    border: 'border-rose-200',
    borderDark: 'dark:border-rose-800',
    text: 'text-rose-600',
    textDark: 'dark:text-rose-400',
    badge: 'bg-rose-100',
    badgeDark: 'dark:bg-rose-900',
    dot: 'bg-rose-500',
  },
  amber: {
    gradient: 'from-amber-100 to-orange-100',
    gradientDark: 'dark:from-amber-950 dark:to-orange-950',
    border: 'border-amber-200',
    borderDark: 'dark:border-amber-800',
    text: 'text-amber-600',
    textDark: 'dark:text-amber-400',
    badge: 'bg-amber-100',
    badgeDark: 'dark:bg-amber-900',
    dot: 'bg-amber-500',
  },
  violet: {
    gradient: 'from-violet-100 to-purple-100',
    gradientDark: 'dark:from-violet-950 dark:to-purple-950',
    border: 'border-violet-200',
    borderDark: 'dark:border-violet-800',
    text: 'text-violet-600',
    textDark: 'dark:text-violet-400',
    badge: 'bg-violet-100',
    badgeDark: 'dark:bg-violet-900',
    dot: 'bg-violet-500',
  },
  sky: {
    gradient: 'from-sky-100 to-cyan-100',
    gradientDark: 'dark:from-sky-950 dark:to-cyan-950',
    border: 'border-sky-200',
    borderDark: 'dark:border-sky-800',
    text: 'text-sky-600',
    textDark: 'dark:text-sky-400',
    badge: 'bg-sky-100',
    badgeDark: 'dark:bg-sky-900',
    dot: 'bg-sky-500',
  },
}

export const FALLBACK_COLOR = COLOR_MAP.indigo

export function getColorClasses(color) {
  return COLOR_MAP[color] ?? FALLBACK_COLOR
}

export const GRADE_MAP = [
  { min: 90, label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900' },
  { min: 75, label: 'Great',     color: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-100 dark:bg-sky-900' },
  { min: 60, label: 'Good',      color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-100 dark:bg-indigo-900' },
  { min: 40, label: 'Fair',      color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900' },
  { min: 0,  label: 'Needs Work', color: 'text-rose-600 dark:text-rose-400',      bg: 'bg-rose-100 dark:bg-rose-900' },
]

export function getGrade(score) {
  return GRADE_MAP.find((g) => score >= g.min) ?? GRADE_MAP[GRADE_MAP.length - 1]
}

// ─── Exam constants ───────────────────────────────────────────────────────────
export const EXAM_STATE_KEY_PREFIX = 'exam-state-'
export const EXAM_MODE_SESSION_KEY = 'exam-mode'
export const EXAM_PASS_THRESHOLD = 50
