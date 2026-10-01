import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { QuizProgressBar } from '../components/quiz/QuizProgressBar'
import { QuizNavigation } from '../components/quiz/QuizNavigation'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useQuiz } from '../hooks/useQuiz'
import { useSubjectData } from '../hooks/useSubjectData'
import { shuffleArray } from '../lib/utils'
import { getColorClasses } from '../lib/constants'
import { EXAM_MODE_SESSION_KEY } from '../lib/examState'
import { getSubjectColor } from '../lib/subjectUtils'
import { cn } from '../lib/utils'
import { getSavedProgress, clearProgress } from '../context/QuizContext'
import { useSound } from '../context/SoundContext'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import DecryptedText from '../components/reactbits/DecryptedText'
import ClickSpark from '../components/reactbits/ClickSpark'
import StarBorder from '../components/reactbits/StarBorder'

// ─── Icons ────────────────────────────────────────────────────────────────────

function SpeakerOnIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function SpeakerOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

// ─── Tooltip phrases ───────────────────────────────────────────────────────────

const TOOLTIP_PHRASES = [
  { text: 'psst… tap me!',          icon: '👆', from: '#7F77DD', to: '#534AB7' },
  { text: 'sound makes it fun!',    icon: '🎵', from: '#1D9E75', to: '#0F6E56' },
  { text: "you're missing out fr",  icon: '💀', from: '#3C3489', to: '#7F77DD' },
  { text: 'click. trust me.',       icon: '🎧', from: '#D85A30', to: '#993C1D' },
  { text: 'unmute for good vibes',  icon: '✨', from: '#BA7517', to: '#854F0B' },
  { text: 'bro… just click it',     icon: '🫵', from: '#D4537E', to: '#993556' },
  { text: 'ur quiz is so quiet rn', icon: '🤫', from: '#378ADD', to: '#185FA5' },
]

function TooltipBubble({ phraseIndex }) {
  const phrase = TOOLTIP_PHRASES[phraseIndex % TOOLTIP_PHRASES.length]

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${phrase.from}, ${phrase.to})`,
        color: 'rgba(255,255,255,0.96)',
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg select-none"
    >
      {/* Wiggling icon */}
      <Motion.span
        animate={{ rotate: [0, -10, 10, -6, 5, 0] }}
        transition={{ duration: 0.55, delay: 0.15, ease: 'easeInOut' }}
        className="text-sm leading-none"
      >
        {phrase.icon}
      </Motion.span>

      {/* Overflow-clipped text reveal */}
      <Motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 'auto', opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="overflow-hidden whitespace-nowrap"
      >
        {phrase.text}
      </Motion.span>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function QuizPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const {
    status, subject, questions, answers, currentIndex,
    answerQuestion, goToQuestion, nextQuestion, prevQuestion, submitQuiz, rehydrate, rehydrateFromProgress,
  } = useQuiz()
  const { getSubjectBySlug } = useSubjectData()
  const { playSound, soundEnabled, toggleSound } = useSound()

  const [showResumeModal, setShowResumeModal] = useState(false)
  const [savedProgress, setSavedProgress] = useState(null)
  const [showFullExplanation, setShowFullExplanation] = useState({})
  const [showSoundTooltip, setShowSoundTooltip] = useState(() => !soundEnabled)

  // Each tooltip dismiss schedules a fresh tooltip key so AnimatePresence
  // remounts TooltipBubble and picks the next phrase
  const [tooltipKey, setTooltipKey] = useState(0)
  const [tooltipPhraseIndex, setTooltipPhraseIndex] = useState(() => Math.floor(Math.random() * TOOLTIP_PHRASES.length))

  // Ref to hold the auto-dismiss timer
  const tooltipTimerRef = useRef(null)

  // Scroll to top when quiz starts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Auto-dismiss tooltip after 3 s
  useEffect(() => {
    if (!showSoundTooltip) return

    tooltipTimerRef.current = window.setTimeout(() => {
      setShowSoundTooltip(false)
    }, 3000)

    return () => {
      window.clearTimeout(tooltipTimerRef.current)
    }
  }, [showSoundTooltip, tooltipKey]) // re-runs on each new tooltip show

  // Handle arrow key navigation (← previous, → next)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevQuestion()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextQuestion()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevQuestion, nextQuestion])

  // Re-hydrate quiz if user refreshed the page
  useEffect(() => {
    if (status === 'idle') {
      const subjectData = getSubjectBySlug(slug)
      if (!subjectData) {
        navigate('/', { replace: true })
        return
      }

      const saved = getSavedProgress(slug)
      if (saved && saved.answers.some(a => a !== null)) {
        setSavedProgress(saved)
        setShowResumeModal(true)
        return
      }

      rehydrate(subjectData, shuffleArray(subjectData.questions))
    }
    if (status === 'completed') {
      const examModeRaw = sessionStorage.getItem(EXAM_MODE_SESSION_KEY)
      if (examModeRaw) {
        try {
          const examMode = JSON.parse(examModeRaw)
          sessionStorage.removeItem(EXAM_MODE_SESSION_KEY)
          navigate('/exam/result', { replace: true, state: { subjectSlug: examMode.subjectSlug } })
        } catch {
          sessionStorage.removeItem(EXAM_MODE_SESSION_KEY)
          navigate('/analytics', { replace: true })
        }
      } else {
        navigate('/analytics', { replace: true })
      }
    }
  }, [status, slug, navigate, getSubjectBySlug, rehydrate])

  function handleResume() {
    rehydrateFromProgress(savedProgress)
    setShowResumeModal(false)
    setSavedProgress(null)
  }

  function handleStartFresh() {
    clearProgress(slug)
    const subjectData = getSubjectBySlug(slug)
    if (subjectData) {
      rehydrate(subjectData, shuffleArray(subjectData.questions))
    }
    setShowResumeModal(false)
    setSavedProgress(null)
  }

  function handleToggleSound() {
    if (soundEnabled) {
      // Turning OFF → show a fresh tooltip phrase
      window.clearTimeout(tooltipTimerRef.current)
      setTooltipPhraseIndex(Math.floor(Math.random() * TOOLTIP_PHRASES.length))
      setTooltipKey(k => k + 1)   // remount TooltipBubble → new phrase
      setShowSoundTooltip(true)
      toggleSound()
      return
    }

    // Turning ON → hide tooltip
    setShowSoundTooltip(false)
    toggleSound()
  }

  // ── Resume modal ─────────────────────────────────────────────────────────────

  if (showResumeModal) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Modal isOpen={showResumeModal} onClose={handleStartFresh} title="Resume Quiz?">
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-base font-bold text-content-primary mb-2">
              You have saved progress!
            </p>
            <p className="text-sm text-content-secondary mb-1">
              {savedProgress?.answers.filter(a => a !== null).length} of {savedProgress?.questions.length} questions answered
            </p>
            <p className="text-xs text-content-secondary mb-6">
              Would you like to continue where you left off?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleStartFresh}>
                Start Fresh
              </Button>
              <StarBorder className="flex-1" color="rgb(var(--accent))" speed="5s">
                <Button className="w-full" onClick={handleResume}>
                  Resume Quiz
                </Button>
              </StarBorder>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ── Loading guard ─────────────────────────────────────────────────────────────

  if (status !== 'active' || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-content-secondary">
          <p className="text-lg font-semibold">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // ── Derived values ────────────────────────────────────────────────────────────

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentIndex] ?? null
  const isLastQuestion = currentIndex === questions.length - 1
  const answeredCount = answers.filter((a) => a !== null).length
  const subjectData = getSubjectBySlug(slug)
  const c = getColorClasses(getSubjectColor(slug ?? ''))

  function handleSubmit() {
    submitQuiz()
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Subject header ─────────────────────────────────────────────────── */}
      <div className="relative z-30 flex items-center justify-between mb-6">
        <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold', c.badge, c.badgeDark, c.text, c.textDark)}>
          <span>{subjectData?.icon}</span>
          <DecryptedText text={subject || ''} speed={40} maxIterations={8} animateOn="view" className="font-bold" />
        </div>

        <div className="flex items-center gap-2">

          {/* ── Sound toggle + tooltip ──────────────────────────────────────── */}
          <div className="relative z-50">
            <Motion.button
              onClick={handleToggleSound}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-themed-accent',
                soundEnabled
                  ? 'text-themed-accent bg-themed-accent/10'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
              )}
            >
              <AnimatePresence mode="wait">
                {soundEnabled ? (
                  <Motion.span
                    key="on"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SpeakerOnIcon className="w-4 h-4" />
                  </Motion.span>
                ) : (
                  <Motion.span
                    key="off"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SpeakerOffIcon className="w-4 h-4" />
                  </Motion.span>
                )}
              </AnimatePresence>
            </Motion.button>

            {/* ── Surprise tooltip ─────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {showSoundTooltip && !soundEnabled && (
                <Motion.div
                  key={tooltipKey}
                  initial={{ opacity: 0, scale: 0.55, y: 8, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: 5, rotate: 3 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 18,
                    mass: 0.8,
                  }}
                  className="absolute right-0 top-full mt-2 z-[60]"
                >
                  <TooltipBubble phraseIndex={tooltipPhraseIndex} />

                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 rounded-sm"
                    style={{
                      background: TOOLTIP_PHRASES[tooltipPhraseIndex].from,
                    }}
                  />
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/"
            className="text-xs text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </Link>
        </div>
      </div>

      {/* ── Quiz card ──────────────────────────────────────────────────────── */}
      <ClickSpark sparkColor="rgb(var(--accent))" sparkSize={12} sparkRadius={30} sparkCount={10} duration={500}>
        <div className="card p-6 sm:p-8">
          <QuizProgressBar
            current={currentIndex + 1}
            total={questions.length}
            answeredCount={answeredCount}
          />

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedIndex={currentAnswer}
            isSubmitted={currentAnswer !== null}
            onSelect={(i) => {
              answerQuestion(currentIndex, i)
              playSound(i === currentQuestion.correctIndex ? 'Correct' : 'Incorrect')
            }}
          />

          <QuizNavigation
            currentIndex={currentIndex}
            total={questions.length}
            selectedIndex={currentAnswer}
            isLastQuestion={isLastQuestion}
            onPrev={prevQuestion}
            onNext={nextQuestion}
            onSubmit={handleSubmit}
          />

          {/* ── Explanation ──────────────────────────────────────────────── */}
          {currentAnswer !== null && (currentQuestion.shortExplanation || currentQuestion.explanation) && (
            <Motion.div
              key={`explanation-${currentIndex}`}
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-6 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                    💡
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                      Quick Answer
                    </p>
                    <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                      {currentQuestion.shortExplanation || currentQuestion.explanation.split('.').slice(0, 2).join('.') + '.'}
                    </p>

                    {currentQuestion.explanation && (
                      <>
                        <button
                          onClick={() => setShowFullExplanation((prev) => ({
                            ...prev,
                            [currentIndex]: !prev[currentIndex]
                          }))}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                        >
                          {showFullExplanation[currentIndex] ? '▲ Show Less' : '▼ Know More'}
                        </button>

                        {showFullExplanation[currentIndex] && (
                          <Motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                                Detailed Explanation
                              </p>
                              <div className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed space-y-2">
                                {currentQuestion.explanation.split('\n\n').map((para, i) => (
                                  <p key={i}>{para}</p>
                                ))}
                              </div>
                            </div>
                          </Motion.div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </div>
      </ClickSpark>

      {/* ── Question palette ───────────────────────────────────────────────── */}
      {questions.length > 1 && (
        <div className="mt-4 card p-4">
          <p className="text-xs text-content-secondary font-semibold mb-3">Question Palette</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => goToQuestion(i)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                  i === currentIndex
                    ? 'bg-themed-accent text-white shadow-md'
                    : answers[i] !== null
                      ? answers[i] === questions[i].correctIndex
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                      : 'bg-surface-secondary text-content-secondary hover:bg-themed-accent/10 hover:text-themed-accent'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}