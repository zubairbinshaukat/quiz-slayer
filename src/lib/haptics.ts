import { isLiteActive } from './liteMode'

export type HapticKind = 'tap' | 'correct' | 'wrong'

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  correct: [12],
  wrong: [30, 40, 30],
}

/**
 * Short vibration feedback. No-op where the Vibration API is missing (iOS Safari, desktop)
 * and in lite mode. Independent of the sound setting. Never throws.
 */
export function haptic(kind: HapticKind): void {
  if (isLiteActive()) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(PATTERNS[kind])
  } catch { /* blocked (e.g. no user activation yet) */ }
}
