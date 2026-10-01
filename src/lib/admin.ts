import { lsGet, lsRemove, lsSet } from './storage'
import { ADMIN_TOKEN_KEY } from './storageKeys'

/** Owner stats session token (validated server-side on every /stats query). */
export function getAdminToken(): string | null {
  const t = lsGet(ADMIN_TOKEN_KEY)
  return t && /^[0-9a-f]{64}$/.test(t) ? t : null
}

export function setAdminToken(token: string): void {
  lsSet(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  lsRemove(ADMIN_TOKEN_KEY)
}
