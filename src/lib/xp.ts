import { useSyncExternalStore } from 'react'
import { XP_KEY } from './storageKeys'

/** Cosmetic, device-local XP: +10 per correct answer. Never sent anywhere and unrelated to leaderboard points. */
export const XP_PER_CORRECT = 10

const listeners = new Set<() => void>()

function getXp(): number {
  try {
    const n = Number(localStorage.getItem(XP_KEY))
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function addXp(amount: number): void {
  if (amount <= 0) return
  try {
    localStorage.setItem(XP_KEY, String(getXp() + Math.floor(amount)))
  } catch { /* storage unavailable: cosmetic only */ }
  for (const l of listeners) l()
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === XP_KEY) onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/** Live XP total. */
export function useXp(): number {
  return useSyncExternalStore(subscribe, getXp, () => 0)
}

export function formatXp(n: number): string {
  return `${n.toLocaleString('en-US')} XP`
}
