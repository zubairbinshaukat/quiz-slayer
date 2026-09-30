import { createContext } from 'react'
import type { Answer, Question, QuizMode, QuizResult, QuizStatus, SavedProgress, SubjectMeta } from '../types'

export interface QuizState {
  subject: string | null
  slug: string | null
  questions: Question[]
  answers: Answer[]
  currentIndex: number
  startTime: Date | null
  status: QuizStatus
  result: QuizResult | null
  mode: QuizMode
}

export interface QuizActions {
  startQuiz: (subjectMeta: SubjectMeta, questions: Question[], mode?: QuizMode) => void
  /** Restart with only the wrong questions of the completed quiz. Returns count started (0 = nothing done). */
  startRetry: () => number
  answerQuestion: (questionIndex: number, optionIndex: number) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  submitQuiz: () => void
  resetQuiz: () => void
  rehydrate: (subjectMeta: SubjectMeta, questions: Question[]) => void
  rehydrateFromProgress: (saved: SavedProgress) => void
}

export type QuizContextValue = QuizState & QuizActions

export const QuizContext = createContext<QuizContextValue | null>(null)
