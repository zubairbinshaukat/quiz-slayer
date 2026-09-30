import { PROGRESS_KEY_PREFIX } from './constants'
import { isRecord, type Answer, type Question, type QuizMode, type SavedProgress } from '../types'

export function parseQuizMode(v: unknown): QuizMode {
  return v === 'exam' || v === 'retry' ? v : 'quiz'
}

export function clearProgress(slug: string): void {
  try {
    localStorage.removeItem(PROGRESS_KEY_PREFIX + slug)
  } catch { /* ignore */ }
}

export function writeProgress(progress: SavedProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY_PREFIX + progress.slug, JSON.stringify(progress))
  } catch { /* localStorage full — silently fail */ }
}

function isAnswer(v: unknown): v is Answer {
  return v === null || typeof v === 'number'
}

function parseProgress(value: unknown): SavedProgress | null {
  if (!isRecord(value)) return null
  const { slug, subject, questions, answers, currentIndex, startTime } = value
  if (
    typeof slug !== 'string' ||
    typeof subject !== 'string' ||
    !Array.isArray(questions) ||
    !Array.isArray(answers) ||
    !answers.every(isAnswer)
  ) {
    return null
  }
  return {
    slug,
    subject,
    // Questions were written by this app from validated data
    questions: questions as Question[],
    answers,
    currentIndex: typeof currentIndex === 'number' ? currentIndex : 0,
    startTime: typeof startTime === 'string' ? startTime : new Date().toISOString(),
    mode: parseQuizMode(value.mode),
  }
}

export function getSavedProgress(slug: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY_PREFIX + slug)
    return raw ? parseProgress(JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}
