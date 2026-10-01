import { useSyncExternalStore } from 'react'

/**
 * Which device-link sheet is open, app-wide (opened from Settings, the landing
 * banner or the /link route; rendered once by <DeviceLinkHost>).
 *  - approve: this (existing) device links a new one: approves its code, or shows an invite
 *  - join: this (new) device joins an existing one: claims its invite, or shows a code
 * `code` arrives pre-filled from a scanned QR.
 */
export type LinkKind = 'approve' | 'join'
export type LinkSheet = { kind: LinkKind; code?: string } | null

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

/**
 * Laptops and desktops show the QR; phones and tablets scan it (a laptop webcam
 * can't comfortably read a phone screen). Either side can still switch.
 */
export const prefersShowingQr = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Query param per QR direction. `c` = a new device's code (the scanner approves it),
 * `j` = an existing device's invite (the scanner joins it).
 */
const PARAM: Record<LinkKind, string> = { approve: 'c', join: 'j' }

/** URL encoded in the QR code. `opens` is the sheet it opens on the device that scans it. */
export function linkUrl(code: string, opens: LinkKind): string {
  return `${window.location.origin}/link?${PARAM[opens]}=${code}`
}

/** Reads /link?c= or /link?j= into the sheet to open. */
export function linkSheetFromParams(params: URLSearchParams): Exclude<LinkSheet, null> {
  for (const kind of ['approve', 'join'] as const) {
    const code = params.get(PARAM[kind])
    if (code && /^\d{6}$/.test(code)) return { kind, code }
  }
  return { kind: 'approve' }
}

/**
 * Extracts a 6-digit code for the `kind` sheet from a scanned QR payload (our URL
 * or bare digits). 'wrong_way' = a QR meant for the other device.
 */
export function parseLinkPayload(raw: string, kind: LinkKind): string | 'wrong_way' | null {
  const text = raw.trim()
  if (/^\d{6}$/.test(text)) return text
  try {
    const sheet = linkSheetFromParams(new URL(text).searchParams)
    if (!sheet.code) return null
    return sheet.kind === kind ? sheet.code : 'wrong_way'
  } catch {
    return null
  }
}
