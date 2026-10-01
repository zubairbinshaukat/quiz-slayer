import { ROUTES } from '../../lib/constants'
import type { IconName } from '../ui/Icon'

export interface NavItem {
  to: string
  label: string
  icon: IconName
  match: (pathname: string) => boolean
}

/** Primary destinations shared by the sidebar (desktop), navbar (tablet) and tab bar (mobile). */
export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.HOME, label: 'Home', icon: 'home', match: (p) => p === '/' || p === '/analytics' || p === '/upload' },
  { to: ROUTES.LEADERBOARD, label: 'Leaderboard', icon: 'trophy', match: (p) => p.startsWith('/leaderboard') },
  { to: ROUTES.HISTORY, label: 'History', icon: 'history', match: (p) => p.startsWith('/history') },
]
