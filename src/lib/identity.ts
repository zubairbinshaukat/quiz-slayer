import { useSyncExternalStore } from 'react'
import { api } from '../../convex/_generated/api'
import { convexClient, withTimeout } from './convex'
import { getDeviceId, hasStoredDeviceId } from './deviceId'
import { lsGet, lsRemove, lsSet } from './storage'
import {
  IDENTITY_VERSION_KEY,
  LEGACY_CLAIM_KEY,
  PLAYER_SECRET_KEY,
  RETIRED_LEADERBOARD_CACHE_KEY,
} from './storageKeys'

/**
 * Player identity. A random 32-hex secret (localStorage `qs-player-secret`)
 * identifies the server player; `qs-device-id` stays the per-device id. Two
 * linked devices share one secret. The server row is created lazily: after
 * the first finished quiz or the first leaderboard visit.
 */

const SECRET_PATTERN = /^[0-9a-f]{32}$/

function readSecret(): string | null {
  const s = lsGet(PLAYER_SECRET_KEY)
  return s && SECRET_PATTERN.test(s) ? s : null
}

function generateSecret(): string {
  const bytes = new Uint8Array(16)
  try {
    crypto.getRandomValues(bytes)
  } catch {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

let secret: string | null = readSecret()
const listeners = new Set<() => void>()

function setSecret(next: string): void {
  secret = next
  lsSet(PLAYER_SECRET_KEY, next)
  for (const l of listeners) l()
}

export function getPlayerSecret(): string | null {
  return secret
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Current secret (null until first needed); re-renders when a link replaces it. */
export function usePlayerSecret(): string | null {
  return useSyncExternalStore(subscribe, getPlayerSecret, getPlayerSecret)
}

/** Call once before anything can create a device id (e.g. analytics). */
export function initIdentity(): void {
  lsRemove(RETIRED_LEADERBOARD_CACHE_KEY)
  if (lsGet(IDENTITY_VERSION_KEY) === '2') return
  // A device id from before secrets existed means this device may already own a
  // server player: give it a secret now and claim that player (see startIdentitySync).
  if (!secret && hasStoredDeviceId()) {
    setSecret(generateSecret())
    lsSet(LEGACY_CLAIM_KEY, '1')
  }
  lsSet(IDENTITY_VERSION_KEY, '2')
}

let ensuredFor: string | null = null
let inflight: Promise<string | null> | null = null

/**
 * Makes sure the server player exists (creating or claiming it). Resolves to the
 * secret, or null when Convex is off or unreachable (callers retry later).
 */
export function ensurePlayer(): Promise<string | null> {
  const client = convexClient
  if (!client || !navigator.onLine) return Promise.resolve(null)
  if (!secret) setSecret(generateSecret())
  const s = secret as string
  if (ensuredFor === s) return Promise.resolve(s)
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const deviceId = getDeviceId()
      if (lsGet(LEGACY_CLAIM_KEY) === '1') {
        await withTimeout(client.mutation(api.players.claimLegacy, { deviceId, secret: s }))
        lsRemove(LEGACY_CLAIM_KEY)
      } else {
        await withTimeout(client.mutation(api.players.ensurePlayer, { secret: s, deviceId }))
      }
      ensuredFor = s
      return s
    } catch {
      return null
    } finally {
      inflight = null
    }
  })()
  return inflight
}

/** Linking: this device now plays as the other device's player. */
export function adoptPlayerSecret(next: string): void {
  if (!SECRET_PATTERN.test(next)) throw new Error('Invalid player secret')
  lsRemove(LEGACY_CLAIM_KEY)
  ensuredFor = next // redeem only succeeds for an existing player
  setSecret(next)
}

/** A device-id era player claims its secret as soon as there is a connection. */
export function startIdentitySync(): void {
  if (!convexClient || typeof window === 'undefined' || lsGet(LEGACY_CLAIM_KEY) !== '1') return
  const run = () => {
    if (lsGet(LEGACY_CLAIM_KEY) === '1') void ensurePlayer()
  }
  window.addEventListener('online', run)
  run()
}
