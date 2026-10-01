import { DEVICE_ID_KEY } from './storageKeys'

function randomHex(bytes: number): string {
  let out = ''
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  }
  return out
}

function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch { /* fall through */ }
  return randomHex(16)
}

let memoryId: string | null = null

/** Stable anonymous device identifier persisted in localStorage. */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const id = memoryId ?? generateId()
    memoryId = id
    localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    memoryId ??= generateId()
    return memoryId
  }
}