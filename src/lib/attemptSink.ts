import { convexEnabled } from './convex'
import type { HistoryEntry } from '../types'

export type AttemptRecord = HistoryEntry & { deviceId: string }

/**
 * Forwards a finished attempt to the global leaderboard backend.
 * No-op while Convex is not configured.
 */
export function recordAttempt(entry: AttemptRecord): void {
  if (!convexEnabled) return
  // TODO(phase3): call api.attempts.record with the entry (answered/correct/wrong/optionsCount).
  void entry
}
