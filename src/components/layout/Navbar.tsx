import { Link, useLocation } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useTheme } from '../../hooks/useTheme'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Logo, LogoWordmark } from '../brand/Logo'
import { IconButton } from '../ui/Button'
import { Icon, type IconName } from '../ui/Icon'

function NavIconLink({ to, label, icon, className }: { to: string; label: string; icon: IconName; className?: string }) {
  const { pathname } = useLocation()
  const active = pathname === to || pathname.startsWith(`${to}/`)
  return (
    <Link
      to={to}
      viewTransition
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

  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-line bg-bg [view-transition-name:navbar]">
      <div className="mx-auto flex h-14 max-w-[760px] items-center justify-between gap-2 px-4">
        <Link to={ROUTES.HOME} viewTransition className="press -ml-1 flex items-center rounded-btn p-1 text-fg" aria-label="Quiz Slayer home">
          <Logo size={28} title="" className="text-accent min-[400px]:hidden" />
          <LogoWordmark size={24} title="" markClassName="text-accent" className="max-[399px]:hidden" />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          <NavIconLink to={ROUTES.EXAM} label="Mock exams" icon="exam" className="max-md:hidden" />
          <NavIconLink to={ROUTES.LEADERBOARD} label="Leaderboard" icon="trophy" />
          <NavIconLink to={ROUTES.HISTORY} label="History" icon="history" />
          <IconButton label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} onClick={toggleSound} active={soundEnabled}>
            <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} />
          </IconButton>
          <IconButton label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </IconButton>
        </nav>
      </div>
    </header>
  )
}
