import { useSyncExternalStore } from 'react'
import { getInstallState, isIOS, promptInstall, subscribeInstall } from '../lib/installPrompt'

const IOS = isIOS()

export interface UseInstallPrompt {
  /** Native install prompt is available (Chromium) */
  canPrompt: boolean
  /** Already running as an installed app */
  installed: boolean
  /** iOS: no prompt API, show Add to Home Screen steps instead */
  ios: boolean
  /** Opens the native prompt; resolves true when accepted */
  prompt: () => Promise<boolean>
}

export function useInstallPrompt(): UseInstallPrompt {
  const { canPrompt, installed } = useSyncExternalStore(subscribeInstall, getInstallState, getInstallState)
  return { canPrompt, installed, ios: IOS, prompt: promptInstall }
}
