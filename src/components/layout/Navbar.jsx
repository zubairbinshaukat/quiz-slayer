import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useSound } from '../../context/SoundContext'
import { cn } from '../../lib/utils'
import ShinyText from '../reactbits/ShinyText'

/* ─── SVG Icons ──────────────────────────────────────────────────── */
function TargetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function HistoryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

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

/* ─── Sound Toggle ───────────────────────────────────────────────── */
function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound()

  return (
    <motion.button
      onClick={toggleSound}
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
          <motion.span
            key="on"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SpeakerOnIcon className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            key="off"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SpeakerOffIcon className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ─── Theme Toggle ───────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      aria-label="Toggle theme"
      className={cn(
        'relative w-14 h-8 rounded-full transition-colors duration-500 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-themed-accent focus-visible:ring-offset-2',
        'focus-visible:ring-offset-surface-primary',
        isDark
          ? 'bg-gradient-to-r from-indigo-900 to-slate-800'
          : 'bg-gradient-to-r from-amber-200 to-orange-200'
      )}
    >
      {/* Stars in dark mode */}
      <AnimatePresence>
        {isDark && (
          <>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-white/70"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 left-4 w-0.5 h-0.5 rounded-full bg-white/50"
            />
          </>
        )}
      </AnimatePresence>

      {/* Thumb */}
      <motion.span
        className={cn(
          'absolute top-1 left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center',
          isDark
            ? 'bg-slate-700'
            : 'bg-white'
        )}
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MoonIcon className="w-3.5 h-3.5 text-indigo-300" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SunIcon className="w-3.5 h-3.5 text-amber-500" />
            </motion.span>
          ) }
        </AnimatePresence>
      </motion.span>
    </motion.button>
  )
}

/* ─── Navbar ─────────────────────────────────────────────────────── */
export function Navbar() {
  const location = useLocation()
  const isHistory = location.pathname === '/history'

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-themed-border"
      style={{
        background: 'rgb(var(--bg-card) / 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'rgb(var(--accent))' }}
          >
            <TargetIcon className="w-5 h-5 text-white" />
          </motion.div>
          <span
            className="font-black text-lg tracking-tight"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            Quiz{' '}
            <ShinyText text="Slayer" speed={3} className="font-black" color="rgb(var(--accent))" shineColor="rgb(var(--accent-hover))" />
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/history"
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              isHistory
                ? 'text-themed-accent'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
            )}
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>

            {/* Active indicator */}
            {isHistory && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl -z-10"
                style={{ background: 'rgb(var(--accent) / 0.1)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </Link>

          <SoundToggle />

          {/* Divider */}
          <div
            className="w-px h-6 mx-1 hidden sm:block"
            style={{ background: 'rgb(var(--border))' }}
          />

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
