import { useSyncExternalStore } from 'react'

/**
 * Which device-link sheet is open, app-wide (opened from Settings, the landing
 * banner or the /link?c= route; rendered once by <DeviceLinkHost>).
 *  - approve: this (existing) device approves another device's code
 *  - join: this (new) device shows a code to be approved
 */
export type LinkSheet = { kind: 'approve'; code?: string } | { kind: 'join' } | null

let current: LinkSheet = null
const listeners = new Set<() => void>()

function set(next: LinkSheet): void {
  current = next
  for (const l of listeners) l()
}

export function openLinkSheet(sheet: Exclude<LinkSheet, null>): void {
  set(sheet)
}

export function closeLinkSheet(): void {
  set(null)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const get = () => current

export function useLinkSheet(): LinkSheet {
  return useSyncExternalStore(subscribe, get, get)
}

/** In-app QR scanning needs the BarcodeDetector API (Chromium on Android / ChromeOS / macOS). */
export const canScanQr =
  typeof window !== 'undefined' && 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia

/** Builds the URL encoded in the QR code. */
export function linkUrl(code: string): string {
  return `https://quiz.zubyr.dev/link?c=${code}`
}

/** Extracts a 6-digit code from a scanned QR payload (our URL or bare digits). */
export function parseLinkPayload(raw: string): string | null {
  const text = raw.trim()
  if (/^\d{6}$/.test(text)) return text
  try {
    const c = new URL(text).searchParams.get('c')
    return c && /^\d{6}$/.test(c) ? c : null
  } catch {
    return null
  }
}
