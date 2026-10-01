import { useEffect } from 'react'
import { useLiteMode } from '../../hooks/useLiteMode'
import { setLenis } from '../../lib/lenis'

// Only the long browsing pages are smoothed; everywhere else `prevent`
// hands scrolling back to the browser.
const SMOOTH_SCROLL_PATHS = new Set(['/', '/history', '/leaderboard'])

/**
 * Root Lenis instance, created after first paint (the library is a lazy chunk) and only where it
 * does something: Lenis smooths wheel scrolling, so touch-only devices never download it.
 * Toggling lite mode creates or destroys it without remounting the app. useLenis() reads it.
 */
export function SmoothScroll() {
  const { lite } = useLiteMode()

  useEffect(() => {
    if (lite || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    let cancelled = false
    let lenis: import('lenis').default | undefined
    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({ autoRaf: true, prevent: () => !SMOOTH_SCROLL_PATHS.has(window.location.pathname) })
      setLenis(lenis)
    })
    return () => {
      cancelled = true
      lenis?.destroy()
      setLenis(undefined)
    }
  }, [lite])

  return null
}
