import { useEffect, useState } from 'react'

/**
 * Animates a number from `from` to `to` over `duration` seconds using rAF.
 * Respects prefers-reduced-motion by jumping straight to the final value.
 */
export function useCountUp(to: number, duration = 1, from = 0): number {
  const [value, setValue] = useState(from)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    const start = performance.now()
    const ms = Math.max(0, duration * 1000)

    const tick = (now: number) => {
      const t = reduced || ms === 0 ? 1 : Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setValue(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration, from])

  return value
}
