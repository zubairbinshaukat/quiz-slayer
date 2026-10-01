import { parseQuizMode } from './quizProgress'
import { ANALYTICS_KEY } from './storageKeys'
import { isRecord, type AnalyticsSnapshot, type Answer, type Question } from '../types'

function isAnswer(v: unknown): v is Answer {
  return v === null || typeof v === 'number'
}

/** Reads and validates the results snapshot stored by QuizContext.submitQuiz. */
export function readAnalyticsSnapshot(): AnalyticsSnapshot | null {
  try {
    const stored = sessionStorage.getItem(ANALYTICS_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (!isRecord(parsed)) return null
    const { result, subject, questions, answers } = parsed
    if (
      !isRecord(result) ||
      typeof result.correct !== 'number' ||
      typeof result.total !== 'number' ||
      typeof result.score !== 'number' ||
      typeof result.timeTaken !== 'number' ||
      typeof subject !== 'string' ||
      !Array.isArray(questions) ||
      !Array.isArray(answers) ||
      !answers.every(isAnswer)
    ) {
      return null
    }
    return {
      result: {
        correct: result.correct,
        total: result.total,
        score: result.score,
        timeTaken: result.timeTaken,
      },
      subject,
      slug: typeof parsed.slug === 'string' ? parsed.slug : undefined,
      mode: parseQuizMode(parsed.mode),
      // Written by this app from validated question data
      questions: questions as Question[],
      answers,
    }
  } catch {
    return null
  }
}
