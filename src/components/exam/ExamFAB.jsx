import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

function ExamIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function ExamFAB() {
  const location = useLocation()
  const navigate = useNavigate()

  const hidden =
    location.pathname === '/exam' ||
    location.pathname === '/exam/result' ||
    location.pathname.startsWith('/exam/')

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 group"
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgb(var(--accent))' }}
            animate={{ scale: [1, 1.65, 1.65], opacity: [0.35, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
          />

          {/* Button + Tooltip wrapper */}
          <div className="relative">
            {/* Tooltip */}
            <span
              className="absolute -top-11 px-3 py-1.5 rounded-xl
                         bg-surface-card border border-themed-border text-xs font-bold
                         text-content-primary whitespace-nowrap shadow-card
                         opacity-0 group-hover:opacity-100 pointer-events-none
                         transition-opacity duration-200"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              Mock Exams
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45
                               bg-surface-card border-r border-b border-themed-border" />
            </span>

            {/* Button */}
            <motion.button
              onClick={() => navigate('/exam')}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              whileHover={{ scale: 1.13 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-white
                         shadow-[0_8px_32px_rgba(0,0,0,0.25)] focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-themed-accent"
              style={{ background: 'rgb(var(--accent))' }}
              aria-label="Open Mock Exams"
            >
              <ExamIcon />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}