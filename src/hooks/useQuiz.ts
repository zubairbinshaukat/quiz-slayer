import { useContext } from 'react'
import { QuizContext, type QuizContextValue } from '../context/quizContextDef'

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>')
  return ctx
}
