import { ConvexError } from 'convex/values'

/**
 * Reads a deployment environment variable (set in the Convex dashboard or with
 * `npx convex env set`). Goes through globalThis so the shared app tsconfig,
 * which has no Node types, still type-checks this file.
 */
export function readEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  const value = proc?.env?.[name]
  return value && value.length > 0 ? value : undefined
}

/** Cryptographically random hex string of `bytes` bytes. */
export function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Uniform random string of `length` decimal digits. */
export function randomDigits(length: number): string {
  const buf = new Uint32Array(length)
  crypto.getRandomValues(buf)
  return Array.from(buf, (n) => String(n % 10)).join('')
}

/** Length-independent-ish string comparison for secrets (no early exit on the first mismatch). */
export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  return diff === 0
}

/** Rounds to 2 decimal places. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const SECRET_PATTERN = /^[0-9a-f]{32}$/

export function assertSecret(secret: string): void {
  if (!SECRET_PATTERN.test(secret)) throw new ConvexError('Invalid player secret')
}

export function assertDeviceId(deviceId: string): void {
  if (deviceId.length < 8 || deviceId.length > 128) throw new ConvexError('Invalid device id')
}
