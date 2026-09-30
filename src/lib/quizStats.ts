import type { Answer, Question } from '../types'

/** Questions answered incorrectly (unanswered counts as wrong). */
export function getWrongQuestions(questions: Question[], answers: Answer[]): Question[] {
  return questions.filter((q, i) => answers[i] !== q.correctIndex)
}

/** Max options length across questions (typically 4). */
export function getOptionsCount(questions: Question[]): number {
  return questions.reduce((max, q) => Math.max(max, q.options.length), 0)
}