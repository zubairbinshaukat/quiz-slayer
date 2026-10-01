import { useEffect, useState } from 'react'
import { isLiteActive } from '../../lib/liteMode'
import { PRELOADED_KEY as SESSION_FLAG } from '../../lib/storageKeys'
import { prefersReducedMotion } from '../../lib/viewTransition'
import { MARK as LOGO_MARK_PATHS } from './logoPaths'

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
 * First-visit-per-session splash: the sliced S is stroked in, filled, then the
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
      <svg viewBox="0 0 24 24" width="88" height="88" className="text-accent">
        {LOGO_MARK_PATHS.map((d, i) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            fill="currentColor"
            fillOpacity={0}
            stroke="currentColor"
            strokeWidth={0.6}
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1}
            style={{
              animation: `draw ${DRAW_MS * 0.7}ms var(--ease-out-quint) ${i * 120}ms forwards, fill-in 260ms ease-out ${DRAW_MS * 0.6}ms forwards`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
