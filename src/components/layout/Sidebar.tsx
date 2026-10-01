import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Logo } from '../brand/Logo'
import { Icon } from '../ui/Icon'
import { NAV_ITEMS } from './navItems'
import { ThemeToggle } from './ThemeToggle'

const ITEM = 'press group relative flex size-12 items-center justify-center rounded-[14px]'

/** Hover / focus label to the right of a sidebar item. */
function Tip({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-line-strong',
        'bg-surface-3 px-2.5 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-[var(--float)] transition-opacity duration-150',
        'group-hover:opacity-100 group-focus-visible:opacity-100',
      )}
    >
      {children}
    </span>
  )
}

interface SidebarProps {
  onOpenSettings: () => void
  onLogoTap: () => void
}

/** Desktop (≥1024px) icon rail: logo, primary destinations, settings at the bottom. */
export function Sidebar({ onOpenSettings, onLogoTap }: SidebarProps) {
  const { pathname } = useLocation()
  const { lite } = useLiteMode()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center border-r border-line bg-surface py-5 lg:flex [view-transition-name:sidebar]">
      <Link
        to={ROUTES.HOME}
        viewTransition={!lite}
        onClick={onLogoTap}
        aria-label="Quiz Slayer home"
        className={cn(ITEM, 'text-fg hover:text-accent')}
      >
        <Logo size={30} title="" className="transition-colors duration-200" />
      </Link>

      <div className="my-5 h-px w-8 bg-line" aria-hidden="true" />

      <nav aria-label="Primary" className="flex flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              viewTransition={!lite}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(ITEM, active ? 'bg-accent/15 text-accent-fg' : 'text-muted hover:bg-surface-2 hover:text-fg')}
            >
              {active && (
                <span aria-hidden="true" className="absolute -left-[14px] top-2 bottom-2 w-[3px] rounded-r-full bg-accent" />
              )}
              <Icon name={item.icon} size={22} strokeWidth={active ? 2.25 : 2} />
              <Tip>{item.label}</Tip>
            </Link>
          )
        })}
      </nav>

      {/* Theme + Settings as a pair at the bottom */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <ThemeToggle className="size-12 rounded-[14px]" />
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          aria-haspopup="dialog"
          className={cn(ITEM, 'text-muted hover:bg-surface-2 hover:text-fg')}
        >
          <Icon name="settings" size={22} />
          <Tip>Settings</Tip>
        </button>
      </div>
    </aside>
  )
}
