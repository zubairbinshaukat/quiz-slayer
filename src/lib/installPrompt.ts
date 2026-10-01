import { lsGet, lsRemove, lsSet } from './storage'
import { INSTALLED_KEY } from './storageKeys'

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
  /**
   * Running as an installed app, or known to be installed on this device while open in a
   * browser tab (the installed app shares storage with its browser on Android and desktop).
   */
  installed: boolean
}

let deferred: BeforeInstallPromptEvent | null = null
let state: InstallState = { canPrompt: false, installed: false }
const listeners = new Set<() => void>()

function set(next: Partial<InstallState>): void {
  state = { ...state, ...next }
  for (const l of listeners) l()
}

function markInstalled(): void {
  lsSet(INSTALLED_KEY, '1')
  set({ installed: true })
}

/** Running as an installed app (display-mode standalone, or iOS home-screen launch). */
export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
}

/** Chromium on Android / Windows can confirm the app is installed via the manifest's related_applications. */
async function checkRelatedApps(): Promise<void> {
  const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> }
  if (typeof nav.getInstalledRelatedApps !== 'function') return
  try {
    const apps = await nav.getInstalledRelatedApps()
    if (apps.length > 0) markInstalled()
  } catch { /* unsupported context */ }
}

export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return
  state = { canPrompt: false, installed: isStandalone() || lsGet(INSTALLED_KEY) === '1' }
  if (isStandalone()) lsSet(INSTALLED_KEY, '1')
  else void checkRelatedApps()

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // keep the mini-infobar away; we show our own card
    deferred = e as BeforeInstallPromptEvent
    // Chromium only offers the prompt when the app is NOT installed: the app was uninstalled
    lsRemove(INSTALLED_KEY)
    set({ canPrompt: true, installed: false })
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    set({ canPrompt: false })
    markInstalled()
  })
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', (e) => {
    if (e.matches) markInstalled()
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
  if (outcome === 'accepted') markInstalled()
  return outcome === 'accepted'
}

/** iPhone / iPad (including iPadOS reporting as Mac): no prompt API, install via Share. */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
