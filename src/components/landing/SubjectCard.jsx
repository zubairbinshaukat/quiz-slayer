import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { getColorClasses } from '../../lib/constants'
import { getSubjectColor, getSubjectIconKey } from '../../lib/subjectUtils'
import { SubjectIcon } from '../ui/SubjectIcons'
import { cn } from '../../lib/utils'

const tiltSpring = { damping: 20, stiffness: 200, mass: 0.8 }

export function SubjectCard({ subject, slug, questionCount, guessQuestions, isGuess, onStart }) {
  const color = getSubjectColor(slug)
  const iconKey = getSubjectIconKey(slug)
  const c = getColorClasses(color)
  const totalCount = questionCount + (guessQuestions?.length ?? 0)

  const cardRef = useRef(null)
  const rotateX = useSpring(0, tiltSpring)
  const rotateY = useSpring(0, tiltSpring)

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateX.set(y * -10)
    rotateY.set(x * 10)
  }, [rotateX, rotateY])

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border cursor-pointer overflow-hidden',
        'bg-gradient-to-br transition-shadow duration-300',
        'shadow-card hover:shadow-card-hover',
        'min-h-[168px] sm:min-h-[184px]',
        c.gradient, c.gradientDark,
        c.border, c.borderDark
      )}
      onClick={onStart}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onStart()}
      aria-label={`Start ${subject} quiz`}
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/60 dark:bg-white/8" />

      {isGuess && (
        <span
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]"
          aria-hidden
        />
      )}

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4',
          'shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
          c.badge, c.badgeDark, c.text, c.textDark
        )}>
          <SubjectIcon iconKey={iconKey} className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Subject name */}
        <h3 className={cn('text-sm sm:text-base font-extrabold leading-snug mb-auto', c.text, c.textDark)}>
          {subject}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-black/5 dark:border-white/8">
          <div className="flex flex-col gap-0.5">
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
              c.badge, c.badgeDark, c.text, c.textDark
            )}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {totalCount} Q
            </span>
            {guessQuestions?.length > 0 && (
              <span className="text-[10px] text-content-secondary font-semibold pl-1">+Documents extracted MCQS</span>
            )}
          </div>

          <span className={cn(
            'text-xs font-extrabold flex items-center gap-0.5 transition-all duration-300',
            'translate-x-0 group-hover:translate-x-1.5',
            c.text, c.textDark
          )}>
            Start
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
