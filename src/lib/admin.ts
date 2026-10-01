import { useSyncExternalStore } from 'react'
import { lsGet, lsRemove, lsSet } from './storage'
import { ADMIN_TOKEN_KEY } from './storageKeys'

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

/** Owner stats session token (validated server-side on every /stats query). */
export function getAdminToken(): string | null {
  const t = lsGet(ADMIN_TOKEN_KEY)
  return t && /^[0-9a-f]{64}$/.test(t) ? t : null
}

export function setAdminToken(token: string): void {
  lsSet(ADMIN_TOKEN_KEY, token)
  notify()
}

export function clearAdminToken(): void {
  lsRemove(ADMIN_TOKEN_KEY)
  notify()
}

/** The token, re-rendering on sign-in / sign-out (e.g. /stats turns from 404 into stats in place). */
export function useAdminToken(): string | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    getAdminToken,
    () => null,
  )
}
