/**
 * Captures `beforeinstallprompt` as early as possible (the event can fire
 * before any page that wants it has mounted) and exposes a tiny store.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface InstallState {
  /** A deferred native prompt is available */
  canPrompt: boolean
  /** Running as an installed app */
  installed: boolean
}

let deferred: BeforeInstallPromptEvent | null = null
let state: InstallState = { canPrompt: false, installed: false }
const listeners = new Set<() => void>()

function set(next: Partial<InstallState>): void {
  state = { ...state, ...next }
  for (const l of listeners) l()
}

/** Running as an installed app (display-mode standalone, or iOS home-screen launch). */
export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
}

export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return
  state = { canPrompt: false, installed: isStandalone() }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // keep the mini-infobar away; we show our own card
    deferred = e as BeforeInstallPromptEvent
    set({ canPrompt: true })
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    set({ canPrompt: false, installed: true })
  })
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', (e) => {
    if (e.matches) set({ installed: true })
  })
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getInstallState(): InstallState {
  return state
}

/** Shows the native prompt. Resolves true when the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred
  if (!event) return false
  deferred = null // a deferred prompt can only be used once
  set({ canPrompt: false })
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') set({ installed: true })
  return outcome === 'accepted'
}

/** iPhone / iPad (including iPadOS reporting as Mac): no prompt API, install via Share. */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
