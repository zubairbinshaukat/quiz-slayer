import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, useSpring } from 'framer-motion'
import { cn } from '../../lib/utils'
import { getColorClasses } from '../../lib/constants'
import { getUnlockStatus, formatTimeLeft, getBestScore } from '../../lib/examState'
import { SubjectIcon } from '../ui/SubjectIcons'

// ─── Icons ────────────────────────────────────────────────────────────────────

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TrophyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

// ─── Status badge (icon-only, no text) ───────────────────────────────────────

function StatusDot({ isUnlocked, hasMastered, hasAttempts, c }) {
  if (!isUnlocked) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-secondary text-content-secondary border border-themed-border">
        <LockIcon className="w-2.5 h-2.5" />
        Locked
      </span>
    )
  }
  if (hasMastered) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
        <TrophyIcon className="w-2.5 h-2.5" />
        Mastered
      </span>
    )
  }
  if (hasAttempts) {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', c.badge, c.badgeDark, c.text, c.textDark)}>
        <RefreshIcon className="w-2.5 h-2.5" />
        Retake
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
      <CheckIcon className="w-2.5 h-2.5" />
      Available
    </span>
  )
}

// ─── Unlock date label ────────────────────────────────────────────────────────

function unlockDateLabel(unlockUtc) {
  const d = new Date(unlockUtc)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'Asia/Karachi' })
    + ', 09:00 AM PKT'
}

// ─── Tilt spring config ───────────────────────────────────────────────────────

const tiltSpring = { damping: 20, stiffness: 200, mass: 0.8 }

// ─── Main component ───────────────────────────────────────────────────────────

export function ExamSubjectCard({ config, examState, totalPoolSize, onStart }) {
  const [secondsLeft, setSecondsLeft] = useState(() => getUnlockStatus(config.unlockUtc).secondsRemaining)
  const isUnlocked = secondsLeft === 0

  // Countdown tick (only while locked)
  useEffect(() => {
    if (isUnlocked) return
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isUnlocked])

  const { attempts, correctIds } = examState
  const hasMastered = totalPoolSize > 0 && correctIds.length >= totalPoolSize
  const hasAttempts = attempts.length > 0
  const bestScore = getBestScore(attempts)
  const masteredCount = correctIds.length
  const remainingCount = Math.max(0, totalPoolSize - masteredCount)
  const progressPct = totalPoolSize > 0 ? (masteredCount / totalPoolSize) * 100 : 0
  const c = getColorClasses(config.color)
  const isDisabled = !isUnlocked || hasMastered

  // Tilt on hover (same as SubjectCard)
  const cardRef = useRef(null)
  const rotateX = useSpring(0, tiltSpring)
  const rotateY = useSpring(0, tiltSpring)

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || isDisabled) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateX.set(y * -8)
    rotateY.set(x * 8)
  }, [rotateX, rotateY, isDisabled])

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  const timeLabel = formatTimeLeft(secondsLeft)
  // Show live MM:SS countdown only when under 1 hour (label is short, no "left" suffix)
  const isLiveCountdown = !isUnlocked && timeLabel !== null && !timeLabel.includes('left')

  return (
    <motion.div
      ref={cardRef}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      whileHover={!isDisabled ? { y: -4, transition: { type: 'spring', stiffness: 380, damping: 22 } } : {}}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <div
        className={cn(
          'relative flex flex-col rounded-2xl border overflow-hidden',
          'bg-gradient-to-br transition-shadow duration-300',
          isUnlocked && !hasMastered ? 'shadow-card hover:shadow-card-hover cursor-pointer' : 'shadow-card',
          !isUnlocked ? 'cursor-not-allowed' : '',
          c.gradient, c.gradientDark,
          c.border, c.borderDark,
        )}
        onClick={() => !isDisabled && onStart(config)}
        role={!isDisabled ? 'button' : undefined}
        tabIndex={!isDisabled ? 0 : undefined}
        onKeyDown={(e) => e.key === 'Enter' && !isDisabled && onStart(config)}
        aria-label={!isDisabled ? `Start ${config.label} mock exam` : undefined}
      >
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/60 dark:bg-white/8" />

        {/* Lock overlay for locked state */}
        {!isUnlocked && (
          <div className="absolute inset-0 z-10 rounded-2xl bg-surface-primary/50 dark:bg-surface-primary/60 backdrop-blur-[1px]" />
        )}

        <div className="relative z-20 p-5 flex flex-col flex-1">
          {/* Header: icon box + badge */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              'shadow-sm transition-all duration-300',
              !isDisabled ? 'group-hover:scale-110 group-hover:rotate-3' : '',
              c.badge, c.badgeDark, c.text, c.textDark
            )}>
              <SubjectIcon iconKey={config.iconKey} className="w-5 h-5" />
            </div>
            <StatusDot isUnlocked={isUnlocked} hasMastered={hasMastered} hasAttempts={hasAttempts} c={c} />
          </div>

          {/* Subject name + description */}
          <h3 className={cn('text-sm font-extrabold leading-snug mb-1', c.text, c.textDark)}>
            {config.label}
          </h3>
          <p className="text-xs text-content-secondary leading-relaxed mb-auto">
            {config.description}
          </p>

          {/* Mastery progress bar (only when attempts exist) */}
          {hasAttempts && totalPoolSize > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-content-secondary uppercase tracking-wider">Mastery</span>
                <span className={cn('text-[10px] font-bold', c.text, c.textDark)}>
                  {masteredCount} / {totalPoolSize}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', c.dot)}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.3 }}
                />
              </div>
              <div className="flex gap-3 mt-1.5 text-[10px] text-content-secondary">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{masteredCount} mastered</span>
                {remainingCount > 0 && <span className="font-semibold text-rose-500">{remainingCount} left</span>}
              </div>
            </div>
          )}

          {/* Divider + footer */}
          <div className="mt-4 pt-3 border-t border-black/8 dark:border-white/8">
            {isUnlocked ? (
              hasMastered ? (
                /* All mastered state */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <TrophyIcon className="w-4 h-4" />
                    All questions mastered
                  </div>
                </div>
              ) : (
                /* Available / retake state */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-content-secondary font-semibold uppercase tracking-wider">MCQs</span>
                      <span className={cn('text-sm font-black', c.text, c.textDark)}>30</span>
                    </div>
                    {hasAttempts && bestScore !== null && (
                      <>
                        <div className="w-px h-7 bg-black/10 dark:bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-content-secondary font-semibold uppercase tracking-wider">Best</span>
                          <span className={cn('text-sm font-black', c.text, c.textDark)}>{bestScore}%</span>
                        </div>
                        <div className="w-px h-7 bg-black/10 dark:bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-content-secondary font-semibold uppercase tracking-wider">Attempts</span>
                          <span className={cn('text-sm font-black', c.text, c.textDark)}>{attempts.length}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <span className={cn(
                    'flex items-center gap-0.5 text-xs font-extrabold',
                    'transition-transform duration-200',
                    c.text, c.textDark
                  )}>
                    {hasAttempts ? 'Retake' : 'Start'}
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              )
            ) : (
              /* Locked state */
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                  <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-semibold">{unlockDateLabel(config.unlockUtc)}</span>
                </div>
                <div className="text-right shrink-0">
                  {isLiveCountdown ? (
                    /* Under 1 hour: large live countdown */
                    <span className={cn('text-lg font-black font-mono tracking-widest tabular-nums', c.text, c.textDark)}>
                      {timeLabel}
                    </span>
                  ) : (
                    /* Days / hours */
                    <span className={cn('text-sm font-bold', c.text, c.textDark)}>
                      {timeLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
