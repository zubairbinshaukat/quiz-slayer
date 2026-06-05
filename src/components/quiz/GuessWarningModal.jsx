import { useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const WARNING_EN = [
  'Not from your professor — zero authenticity guarantee.',
  'AI-generated MCQs. None of this is compulsory for your exam.',
  'Brutally hard. Expect trick questions and nightmare-level difficulty.',
  'Some questions may be off-syllabus, outdated, or just wrong.',
  'Continue at your own risk. No refunds on your grade.',
]

const WARNING_UR = [
  'یہ سر کی طرف سے نہیں — اصلیت کی کوئی ضمانت نہیں۔',
  'یہاں ہر سوال AI نے بنایا ہے۔ امتحان میں آنا لازمی نہیں۔',
  'انتہائی مشکل — مشکل سوالات اور پریشان کن سوالات کی توقع رکھیں۔',
  'کچھ سوالات نصاب سے باہر، پرانے، یا بالکل غلط ہو سکتے ہیں۔',
  'آگے بڑھنے کا مطلب ہے آپ خود ذمہ دار ہیں۔ گریڈ واپس نہیں ہوگی۔',
]

function HazardStripe() {
  return (
    <div
      className="h-1.5 sm:h-2 w-full shrink-0"
      style={{
        background:
          'repeating-linear-gradient(-45deg, #dc2626 0, #dc2626 10px, #1a1a1a 10px, #1a1a1a 20px)',
      }}
    />
  )
}

function WarningBlock({ lang, lines }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80">{lang}</p>
      <ul className="space-y-1 sm:space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm leading-snug text-red-700 dark:text-red-300">
            <span className="text-red-500 font-black shrink-0 mt-px">✕</span>
            <span className={lang === 'اردو' ? 'text-right w-full' : ''} dir={lang === 'اردو' ? 'rtl' : 'ltr'}>
              {line}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GuessWarningModal({ isOpen, subjectName, onClose, onContinue }) {
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  function handleContinue() {
    onContinue(neverShowAgain)
    setNeverShowAgain(false)
  }

  function handleClose() {
    setNeverShowAgain(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden"
      contentClassName="p-0 flex flex-col min-h-0 overflow-hidden"
    >
      <HazardStripe />

      {/* Scrollable body */}
      <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          {/* Header */}
          <div className="text-center mb-3 sm:mb-4">
            <motion.div
              animate={{ rotate: [0, -4, 4, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-500/15 border-2 border-red-500/40 mb-2 sm:mb-3 shadow-[0_0_24px_rgba(239,68,68,0.25)]"
            >
              <span className="text-2xl sm:text-3xl" role="img" aria-hidden>💀</span>
            </motion.div>

            <motion.p
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-red-600 dark:text-red-400 mb-1"
            >
              ⚠ Warning ⚠
            </motion.p>

            <h2 className="text-lg sm:text-xl font-black text-content-primary leading-tight">
              You Were Warned.
            </h2>
            {subjectName && (
              <p className="text-[11px] sm:text-xs text-content-secondary mt-1 font-semibold line-clamp-2">
                {subjectName}
              </p>
            )}
            <p className="text-[10px] sm:text-[11px] text-red-500/70 font-bold mt-1.5 sm:mt-2 italic">
              Hard mode · No mercy · Your grade may not survive
            </p>
          </div>

          {/* Warning body */}
          <div
            className={cn(
              'relative rounded-xl border-2 border-red-500/50 p-3 sm:p-4 space-y-3 sm:space-y-4',
              'bg-gradient-to-br from-red-50 via-red-50/50 to-orange-50/30',
              'dark:from-red-950/60 dark:via-red-950/40 dark:to-orange-950/20',
              'shadow-[inset_0_0_30px_rgba(239,68,68,0.08)]'
            )}
          >
            <div className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-black text-red-500/40 uppercase tracking-widest rotate-12 select-none">
              unverified
            </div>

            <WarningBlock lang="English" lines={WARNING_EN} />
            <div className="border-t border-red-300/40 dark:border-red-700/40" />
            <WarningBlock lang="اردو" lines={WARNING_UR} />
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2.5 mt-3 sm:mt-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={(e) => setNeverShowAgain(e.target.checked)}
              className="w-4 h-4 rounded accent-red-600 cursor-pointer shrink-0"
            />
            <span className="text-xs text-content-secondary group-hover:text-content-primary transition-colors">
              Never show this again
            </span>
          </label>
        </div>
      </div>

      {/* Sticky footer — always visible on short screens */}
      <div className="shrink-0 px-4 sm:px-6 pb-4 pt-2 border-t border-themed-border/60 bg-surface-card">
        <div className="flex gap-2 sm:gap-3">
          <Button variant="secondary" size="sm" className="flex-1 sm:text-sm" onClick={handleClose}>
            Go Back
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1 font-black sm:text-sm"
            onClick={handleContinue}
          >
            I Accept — Continue →
          </Button>
        </div>
      </div>

      <HazardStripe />
    </Modal>
  )
}
