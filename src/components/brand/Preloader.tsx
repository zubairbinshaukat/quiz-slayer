import { useEffect, useState } from 'react'
import { isLiteActive } from '../../lib/liteMode'
import { PRELOADED_KEY as SESSION_FLAG } from '../../lib/storageKeys'
import { prefersReducedMotion } from '../../lib/viewTransition'
import { Logo } from './Logo'

const DRAW_MS = 900
const FADE_MS = 250 // DRAW_MS + FADE_MS stays under the 1.2s cap

function shouldShow(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_FLAG)) return false
  } catch {
    return false
  }
  return !prefersReducedMotion() && !isLiteActive()
}

/**
 * First-visit-per-session splash: the 3D mark drops in over an amber glow, then the
 * overlay fades. The app renders underneath the whole time (never blocks).
 */
export function Preloader() {
  const [visible, setVisible] = useState(shouldShow)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_FLAG, '1')
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!visible) return
    const fade = window.setTimeout(() => setLeaving(true), DRAW_MS)
    const done = window.setTimeout(() => setVisible(false), DRAW_MS + FADE_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="preloader fixed inset-0 z-[100] flex items-center justify-center bg-bg"
      style={leaving ? { animation: `preloader-out ${FADE_MS}ms ease-out forwards` } : undefined}
    >
      <div className="relative flex items-center justify-center">
        <span className="preloader-glow absolute size-56 rounded-full" />
        <Logo size={120} title="" className="preloader-mark relative" fetchPriority="high" />
      </div>
    </div>
  )
}
