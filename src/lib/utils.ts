import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Safe Tailwind class merging */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Fisher-Yates shuffle — returns a new array */
export function shuffleArray<T>(arr: readonly T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Stopwatch format: mm:ss (h:mm:ss past an hour) */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${String(m).padStart(2, '0')}:${sec}`
}

/** Local time of day, e.g. "3:42 PM" */
export function formatTimeOfDay(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
