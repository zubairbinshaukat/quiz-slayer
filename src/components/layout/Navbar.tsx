import { lazy, Suspense, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { useSound } from '../../hooks/useSound'
import { useTheme } from '../../hooks/useTheme'
import { ROUTES } from '../../lib/constants'
import { convexEnabled } from '../../lib/convex'
import { cn } from '../../lib/utils'
import { Logo, LogoWordmark } from '../brand/Logo'
import { IconButton } from '../ui/Button'
import { Icon, type IconName } from '../ui/Icon'
import { SettingsSheet } from './SettingsSheet'

const AdminPinSheet = lazy(() => import('../admin/AdminPinSheet').then((m) => ({ default: m.AdminPinSheet })))

const SECRET_TAPS = 7
const SECRET_WINDOW_MS = 4000

function NavIconLink({ to, label, icon, className }: { to: string; label: string; icon: IconName; className?: string }) {
  const { pathname } = useLocation()
  const { lite } = useLiteMode()
  const active = pathname === to || pathname.startsWith(`${to}/`)
  return (
    <Link
      to={to}
      viewTransition={!lite}
      aria-label={label}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'press inline-flex size-11 items-center justify-center rounded-btn',
        active ? 'bg-surface-2 text-accent-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      <Icon name={icon} />
    </Link>
  )
}

/** Compact top bar. Hidden on /quiz/* (the quiz has its own focused header). */
export function Navbar() {
  const { soundEnabled, toggleSound } = useSound()
  const { theme, toggleTheme } = useTheme()
  const { lite } = useLiteMode()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const taps = useRef<number[]>([])

  // Owner entry: 7 taps on the logo within 4 s opens the stats PIN prompt
  function onLogoTap() {
    if (!convexEnabled) return
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < SECRET_WINDOW_MS), now]
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = []
      setPinOpen(true)
    }
  }

  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-line bg-bg [view-transition-name:navbar]">
      <div className="mx-auto flex h-14 max-w-[760px] items-center justify-between gap-2 px-4">
        <Link to={ROUTES.HOME} viewTransition={!lite} className="press -ml-1 flex items-center rounded-btn p-1 text-fg" aria-label="Quiz Slayer home" onClick={onLogoTap}>
          <Logo size={28} title="" className="text-accent min-[400px]:hidden" />
          <LogoWordmark size={24} title="" markClassName="text-accent" className="max-[399px]:hidden" />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          <NavIconLink to={ROUTES.LEADERBOARD} label="Leaderboard" icon="trophy" />
          <NavIconLink to={ROUTES.HISTORY} label="History" icon="history" />
          {/* Quick toggles on wider screens; on mobile they live in Settings */}
          <IconButton label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} onClick={toggleSound} active={soundEnabled} className="max-md:hidden">
            <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} />
          </IconButton>
          <IconButton label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme} className="max-md:hidden">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </IconButton>
          <IconButton label="Settings" onClick={() => setSettingsOpen(true)} aria-haspopup="dialog">
            <Icon name="settings" />
          </IconButton>
        </nav>
      </div>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {pinOpen && (
        <Suspense fallback={null}>
          <AdminPinSheet onClose={() => setPinOpen(false)} />
        </Suspense>
      )}
    </header>
  )
}
