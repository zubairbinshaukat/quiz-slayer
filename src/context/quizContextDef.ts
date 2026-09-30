import { createContext } from 'react'
import type { Answer, Question, QuizResult, QuizStatus, SavedProgress, SubjectMeta } from '../types'

export interface QuizState {
  subject: string | null
  slug: string | null
  questions: Question[]
  answers: Answer[]
  currentIndex: number
  startTime: Date | null
  status: QuizStatus
  result: QuizResult | null
}

export interface QuizActions {
  startQuiz: (subjectMeta: SubjectMeta, questions: Question[]) => void
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
