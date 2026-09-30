import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useSound } from '../../hooks/useSound'
import { cn } from '../../lib/utils'

/* ─── SVG Icons ──────────────────────────────────────────────────── */
type IconProps = { className?: string }

function TargetIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function HistoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

function SunIcon({ className }: IconProps) {
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

function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function SpeakerOnIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function SpeakerOffIcon({ className }: IconProps) {
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
    <button
      onClick={toggleSound}
      aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
      className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center transition-[color,background-color,transform] duration-200',
        'hover:scale-110 active:scale-90',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-themed-accent',
        soundEnabled
          ? 'text-themed-accent bg-themed-accent/10'
          : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
      )}
    >
      {soundEnabled ? (
        <SpeakerOnIcon key="on" className="w-4 h-4 animate-pop" />
      ) : (
        <SpeakerOffIcon key="off" className="w-4 h-4 animate-pop" />
      )}
    </button>
  )
}

/* ─── Theme Toggle ───────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative w-14 h-8 rounded-full transition-[color,background-color,transform] duration-500 focus:outline-none',
        'hover:scale-105 active:scale-90',
        'focus-visible:ring-2 focus-visible:ring-themed-accent focus-visible:ring-offset-2',
        'focus-visible:ring-offset-surface-primary',
        isDark
          ? 'bg-gradient-to-r from-indigo-900 to-slate-800'
          : 'bg-gradient-to-r from-amber-200 to-orange-200'
      )}
    >
      {/* Stars in dark mode */}
      {isDark && (
        <>
          <span className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-white/70 animate-fade-in" />
          <span className="absolute top-3 left-4 w-0.5 h-0.5 rounded-full bg-white/50 animate-fade-in" />
        </>
      )}

      {/* Thumb */}
      <span
        className={cn(
          'absolute top-1 left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center',
          'transition-transform duration-300 ease-out',
          isDark
            ? 'bg-slate-700 translate-x-6'
            : 'bg-white translate-x-0'
        )}
      >
        {isDark ? (
          <MoonIcon key="moon" className="w-3.5 h-3.5 text-indigo-300 animate-pop" />
        ) : (
          <SunIcon key="sun" className="w-3.5 h-3.5 text-amber-500 animate-pop" />
        )}
      </span>
    </button>
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
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-12"
            style={{ background: 'rgb(var(--accent))' }}
          >
            <TargetIcon className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-black text-lg tracking-tight"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            Quiz{' '}
            <span className="font-black" style={{ color: 'rgb(var(--accent))' }}>Slayer</span>
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
              <span
                className="absolute inset-0 rounded-xl -z-10"
                style={{ background: 'rgb(var(--accent) / 0.1)' }}
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
