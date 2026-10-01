import { useCallback, useSyncExternalStore } from 'react'

/** Live `matchMedia` result (false during SSR / when unsupported). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia?.(query)
      mq?.addEventListener('change', onChange)
      return () => mq?.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia?.(query).matches ?? false, () => false)
}

/** Desktop shell breakpoint (sidebar + right rails). */
export const DESKTOP_QUERY = '(min-width: 1024px)'
