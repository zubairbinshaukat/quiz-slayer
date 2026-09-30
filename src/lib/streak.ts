import type { HistoryEntry } from '../types'

/** Local calendar day key, e.g. "2026-10-01". */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Consecutive local days (ending today, or yesterday if nothing yet today)
 * with at least one history entry.
 */
export function computeStreak(history: Pick<HistoryEntry, 'dateTaken'>[], now = new Date()): number {
  if (history.length === 0) return 0
  const days = new Set(history.map((e) => dayKey(new Date(e.dateTaken))))
  const cursor = new Date(now)
  // Today not played yet: the streak is still alive from yesterday
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** "Today", "Yesterday", or a short date for grouping headers. */
export function dayLabel(key: string, now = new Date()): string {
  const today = dayKey(now)
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  if (key === today) return 'Today'
  if (key === dayKey(y)) return 'Yesterday'
  const [yy, mm, dd] = key.split('-').map(Number)
  const date = new Date(yy, mm - 1, dd)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(yy !== now.getFullYear() ? { year: 'numeric' } : {}),
  })
}
