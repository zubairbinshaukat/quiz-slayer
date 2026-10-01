import { Link, useLocation } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Icon, type IconName } from '../ui/Icon'

const TABS: { to: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { to: ROUTES.HOME, label: 'Home', icon: 'home', match: (p) => p === '/' || p === '/analytics' || p === '/upload' },
  { to: ROUTES.LEADERBOARD, label: 'Leaderboard', icon: 'trophy', match: (p) => p.startsWith('/leaderboard') },
  { to: ROUTES.HISTORY, label: 'History', icon: 'history', match: (p) => p.startsWith('/history') },
]

/** Mobile bottom navigation (hidden from md up, and on /quiz/*). */
export function TabBar() {
  const { pathname } = useLocation()
  const { lite } = useLiteMode()
  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg md:hidden [view-transition-name:tabbar]"
    >
      <ul className="mx-auto grid h-16 max-w-[640px] grid-cols-3">
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                viewTransition={!lite}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'press relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                  active ? 'text-fg' : 'text-muted',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-0 h-0.5 w-8 rounded-full bg-accent transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon name={tab.icon} size={22} className={active ? 'text-accent-fg' : undefined} />
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
