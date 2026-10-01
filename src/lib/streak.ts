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

/** Longest run of consecutive local study days ever. */
export function computeBestStreak(history: Pick<HistoryEntry, 'dateTaken'>[]): number {
  if (history.length === 0) return 0
  const days = [...new Set(history.map((e) => dayKey(new Date(e.dateTaken))))].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    const [y, m, d] = days[i - 1].split('-').map(Number)
    const next = new Date(y, m - 1, d + 1)
    run = dayKey(next) === days[i] ? run + 1 : 1
    best = Math.max(best, run)
  }
  return best
}

export interface WeekDay {
  key: string
  /** Two-letter label, Mo–Su */
  label: string
  studied: boolean
  today: boolean
  future: boolean
}

const WEEK_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

/** The current Monday-to-Sunday week with study days marked. */
export function currentWeek(history: Pick<HistoryEntry, 'dateTaken'>[], now = new Date()): WeekDay[] {
  const days = new Set(history.map((e) => dayKey(new Date(e.dateTaken))))
  const todayKey = dayKey(now)
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
  return WEEK_LABELS.map((label, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const key = dayKey(date)
    return { key, label, studied: days.has(key), today: key === todayKey, future: key > todayKey }
  })
}

export interface DayCount {
  key: string
  count: number
}

/** Attempts per local day for the last `n` days (oldest first, today last). */
export function dailyCounts(history: Pick<HistoryEntry, 'dateTaken'>[], n: number, now = new Date()): DayCount[] {
  const counts = new Map<string, number>()
  for (const e of history) {
    const key = dayKey(new Date(e.dateTaken))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const out: DayCount[] = []
  for (let i = n - 1; i >= 0; i--) {
    const key = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))
    out.push({ key, count: counts.get(key) ?? 0 })
  }
  return out
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
