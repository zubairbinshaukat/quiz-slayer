import { Link, useLocation } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { useSound } from '../../hooks/useSound'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { LogoWordmark } from '../brand/Logo'
import { IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { NAV_ITEMS } from './navItems'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  onOpenSettings: () => void
  onLogoTap: () => void
}

/**
 * Top bar below 1024px (the sidebar takes over on desktop). Mobile: wordmark + settings only;
 * tablet adds the destinations and quick toggles. Hidden on /quiz/*.
 */
export function Navbar({ onOpenSettings, onLogoTap }: NavbarProps) {
  const { pathname } = useLocation()
  const { soundEnabled, toggleSound } = useSound()
  const { lite } = useLiteMode()

  return (
    <header className="glass pt-safe sticky top-0 z-40 border-b border-line lg:hidden [view-transition-name:navbar]">
      <div className="mx-auto flex h-14 max-w-[1260px] items-center justify-between gap-2 px-4 md:h-16 md:px-6">
        <Link to={ROUTES.HOME} viewTransition={!lite} className="press -ml-1 flex items-center rounded-btn p-1 text-fg" aria-label="Quiz Slayer home" onClick={onLogoTap}>
          <LogoWordmark size={24} title="" />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {NAV_ITEMS.slice(1).map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.to}
                to={item.to}
                viewTransition={!lite}
                aria-label={item.label}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'press inline-flex size-11 items-center justify-center rounded-btn max-md:hidden',
                  active ? 'bg-accent/15 text-accent-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                <Icon name={item.icon} />
              </Link>
            )
          })}
          <IconButton label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} onClick={toggleSound} className="max-md:hidden">
            <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} />
          </IconButton>
          {/* Theme + Settings always travel together on the right */}
          <ThemeToggle />
          <IconButton label="Settings" onClick={onOpenSettings} aria-haspopup="dialog">
            <Icon name="settings" />
          </IconButton>
        </nav>
      </div>
    </header>
  )
}
