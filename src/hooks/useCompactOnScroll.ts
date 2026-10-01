import { useEffect, useState } from 'react'
import { useLenis } from 'lenis/react'

const THRESHOLD = 24

/**
 * True after scrolling down more than ~24px; false again on any scroll up or at the top.
 * Listens to Lenis' scroll event when smooth scrolling is on, the window otherwise; rAF-throttled.
 */
export function useCompactOnScroll(): boolean {
  const lenis = useLenis()
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let anchor = last
    let frame = 0

    const evaluate = () => {
      frame = 0
      const y = window.scrollY
      if (y <= 4) setCompact(false)
      else if (y < last) {
        setCompact(false)
        anchor = y
      } else if (y - anchor > THRESHOLD) setCompact(true)
      last = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(evaluate)
    }

    if (lenis) {
      lenis.on('scroll', onScroll)
    } else {
      window.addEventListener('scroll', onScroll, { passive: true })
    }
    return () => {
      if (lenis) lenis.off('scroll', onScroll)
      else window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [lenis])

  return compact
}
