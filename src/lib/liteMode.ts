import { LITE_MODE_KEY } from './storageKeys'

/** User preference: follow detection, or force lite on/off. */
export type LitePref = 'auto' | 'on' | 'off'

interface NavigatorHints {
  connection?: { saveData?: boolean }
  deviceMemory?: number
}

/**
 * Lite mode signals, checked once per load: reduced motion, Data Saver,
 * ≤2 GB device memory or ≤4 CPU cores. Any one of them turns lite on.
 */
function detectLite(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const nav = navigator as Navigator & NavigatorHints
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true
    if (nav.connection?.saveData) return true
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) return true
  } catch { /* feature probing failed: assume a capable device */ }
  return false
}

/** Auto-detected once on load. */
export const LITE_DETECTED = detectLite()

export function readLitePref(): LitePref {
  try {
    const v = localStorage.getItem(LITE_MODE_KEY)
    if (v === 'on' || v === 'off') return v
  } catch { /* storage unavailable */ }
  return 'auto'
}

export function writeLitePref(pref: LitePref): void {
  try {
    if (pref === 'auto') localStorage.removeItem(LITE_MODE_KEY)
    else localStorage.setItem(LITE_MODE_KEY, pref)
  } catch { /* storage unavailable */ }
}

export function resolveLite(pref: LitePref): boolean {
  return pref === 'auto' ? LITE_DETECTED : pref === 'on'
}

let active = false

/** Current lite state for non-React code (view transitions, count-ups). */
export function isLiteActive(): boolean {
  return active
}

/** Sets `data-lite="true"` on <html> (CSS switches animations off) and the module flag. */
export function applyLite(on: boolean): void {
  active = on
  if (typeof document === 'undefined') return
  if (on) document.documentElement.dataset.lite = 'true'
  else delete document.documentElement.dataset.lite
}

/** Call once before the first render so the attribute is set before paint. */
export function initLiteMode(): void {
  applyLite(resolveLite(readLitePref()))
}
