import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Squares from '../components/reactbits/Squares'
import { HeroSection } from '../components/landing/HeroSection'
import { SubjectCard } from '../components/landing/SubjectCard'
import { AddSubjectCard } from '../components/landing/AddSubjectCard'
import { QuizCard } from '../components/landing/QuizCard'
import { QuizSetupModal } from '../components/quiz/QuizSetupModal'
import { GuessWarningModal } from '../components/quiz/GuessWarningModal'
import { useSubjectData } from '../hooks/useSubjectData'
import { useQuiz } from '../hooks/useQuiz'
import { shuffleArray } from '../lib/utils'
import { ROUTES } from '../lib/constants'
import { isGuessSubject, isGuessWarningDismissed, setGuessWarningDismissed } from '../lib/guessWarning'

export function LandingPage() {
  const { subjects, quizzes, getSubjectBySlug } = useSubjectData()
  const { startQuiz } = useQuiz()
  const navigate = useNavigate()

  const [selectedSlug, setSelectedSlug] = useState(null)
  const [guessWarning, setGuessWarning] = useState(null)
  const selectedSubject = selectedSlug ? getSubjectBySlug(selectedSlug) : null

  function openSubjectSetup(slug) {
    setSelectedSlug(slug)
  }

  function startQuizDirect(quiz) {
    const questions = shuffleArray(quiz.questions)
    startQuiz(quiz, questions)
    navigate(ROUTES.QUIZ_PATH(quiz.slug))
  }

  function maybeWarnBeforeGuess(slug, onProceed) {
    if (isGuessSubject(slug) && !isGuessWarningDismissed()) {
      const item = getSubjectBySlug(slug)
      setGuessWarning({
        slug,
        subjectName: item?.subject ?? '',
        onProceed,
      })
      return
    }
    onProceed()
  }

  function handleCardClick(slug) {
    maybeWarnBeforeGuess(slug, () => openSubjectSetup(slug))
  }

  function handleModalClose() {
    setSelectedSlug(null)
  }

  function handleConfirm(count, questionPool) {
    if (!selectedSubject) return
    const pool = questionPool ?? selectedSubject.questions
    const questions = shuffleArray(pool).slice(0, count)
    startQuiz(selectedSubject, questions)
    setSelectedSlug(null)
    navigate(ROUTES.QUIZ_PATH(selectedSubject.slug))
  }

  function handleQuizCardClick(quiz) {
    maybeWarnBeforeGuess(quiz.slug, () => startQuizDirect(quiz))
  }

  function handleGuessWarningContinue(dismissForever) {
    if (dismissForever) setGuessWarningDismissed()
    const pending = guessWarning
    setGuessWarning(null)
    pending?.onProceed?.()
  }

  function handleGuessWarningClose() {
    setGuessWarning(null)
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-4">
      {/* Animated grid background */}
      <div className="fixed inset-0 -z-10 opacity-[0.04] dark:opacity-[0.08] pointer-events-none">
        <Squares speed={0.3} squareSize={48} direction="diagonal" borderColor="#888" hoverFillColor="#666" />
      </div>
      <HeroSection subjectCount={subjects.length} />

      {/* Subject grid */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.slug}
            {...subject}
            onStart={() => handleCardClick(subject.slug)}
          />
        ))}
        <AddSubjectCard />
      </div>

      {/* Quiz section */}
      {quizzes.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">📝</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-content-primary">Quick Quizzes</h2>
            <span className="text-xs font-bold text-content-secondary bg-surface-secondary px-2 py-0.5 rounded-full">
              {quizzes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.slug}
                {...quiz}
                onStart={() => handleQuizCardClick(quiz)}
              />
            ))}
          </div>
        </div>
      )}

      <GuessWarningModal
        isOpen={!!guessWarning}
        subjectName={guessWarning?.subjectName}
        onClose={handleGuessWarningClose}
        onContinue={handleGuessWarningContinue}
      />

      <QuizSetupModal
        subject={selectedSubject}
        isOpen={!!selectedSlug}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
      />

      {/* Developer credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-16 pt-8 border-t border-themed-border flex items-center justify-center"
      >
        
         <a href="https://www.zubyr.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 bg-black/5 dark:bg-white/5 cursor-pointer"
        >
          <div className="relative">
            <img
              src="https://avatars.githubusercontent.com/u/145450776?v=4"
              alt="Zubair Bin Shaukat"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[rgb(var(--accent))] transition-all duration-300 group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[rgb(var(--bg-primary))] bg-emerald-500" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-content-secondary font-semibold uppercase tracking-widest">
              Built by
            </p>
            <p className="text-sm sm:text-base font-extrabold text-content-primary leading-tight group-hover:text-[rgb(var(--accent))] transition-colors duration-300">
              Zubair Bin Shaukat
            </p>
          </div>
          <svg
            className="w-4 h-4 text-content-secondary -translate-x-1 opacity-100 group-hover:translate-x-0 transition-all duration-300 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </motion.div>
    </div>
  )
}