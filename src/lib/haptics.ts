export type HapticKind = 'tap' | 'correct' | 'wrong'

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  correct: [12],
  wrong: [30, 40, 30],
}

/**
 * Short vibration feedback. No-op where the Vibration API is missing (iOS Safari, desktop).
 * Stays on in lite mode (it costs nothing and budget Android phones are the ones that auto-enable lite).
 * Independent of the sound setting. Never throws.
 */
export function haptic(kind: HapticKind): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(PATTERNS[kind])
  } catch { /* blocked (e.g. no user activation yet) */ }
}
