import type { LenisOptions } from 'lenis'
import { ReactLenis } from 'lenis/react'
import { useLiteMode } from '../../hooks/useLiteMode'

// Only the long browsing pages are smoothed; everywhere else `prevent`
// hands scrolling back to the browser.
const SMOOTH_SCROLL_PATHS = new Set(['/', '/history', '/leaderboard'])
const lenisOptions: LenisOptions = {
  prevent: () => !SMOOTH_SCROLL_PATHS.has(window.location.pathname),
}

/**
 * Root Lenis instance, rendered childless so toggling lite mode mounts or
 * destroys it without remounting the app. useLenis() reads the root store.
 */
export function SmoothScroll() {
  const { lite } = useLiteMode()
  if (lite) return null
  return <ReactLenis root options={lenisOptions} />
}
