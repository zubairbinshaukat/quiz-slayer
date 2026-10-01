import { useSyncExternalStore } from 'react'
import type Lenis from 'lenis'

/**
 * The root Lenis instance, or undefined while it loads, in lite mode and on touch-only devices
 * (Lenis only smooths wheel scrolling). Callers fall back to native scrolling when it is missing.
 * Kept out of `lenis/react` so the library loads on demand instead of in the main bundle.
 */
let instance: Lenis | undefined
const listeners = new Set<() => void>()

export function setLenis(next: Lenis | undefined): void {
  instance = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useLenis(): Lenis | undefined {
  return useSyncExternalStore(subscribe, () => instance, () => undefined)
}
