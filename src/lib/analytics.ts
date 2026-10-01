import type { FunctionArgs } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { convexClient } from './convex'
import { getDeviceId, isNewDevice } from './deviceId'
import { isIOS, isStandalone } from './installPrompt'
import { lsGet, lsSet, ssGet, ssSet } from './storage'
import { INSTALL_COUNTED_KEY, VISIT_TRACKED_KEY } from './storageKeys'

/**
 * Anonymous aggregate counters for the owner (never shown in the app): one
 * visit per browser session and install events. Sends only coarse categories
 * and a truncated hash of the device id. Fire-and-forget; no-op without Convex.
 */

type VisitArgs = FunctionArgs<typeof api.analytics.trackVisit>

/** Coarse device / OS / browser categories from the user agent (the string itself is never sent). */
export function classifyDevice(): Pick<VisitArgs, 'deviceType' | 'os' | 'browser'> {
  const ua = navigator.userAgent
  const ios = isIOS()
  const android = /android/i.test(ua)
  const tablet = /ipad|tablet|playbook|silk/i.test(ua) || (android && !/mobile/i.test(ua)) || (ios && !/iphone|ipod/i.test(ua))
  const mobile = !tablet && (/mobi|iphone|ipod/i.test(ua) || android)

  const os: VisitArgs['os'] = ios
    ? 'ios'
    : android
      ? 'android'
      : /windows/i.test(ua)
        ? 'windows'
        : /macintosh|mac os x/i.test(ua)
          ? 'mac'
          : /linux/i.test(ua) && !/cros/i.test(ua)
            ? 'linux'
            : 'otherOs'

  const browser: VisitArgs['browser'] = /edg(e|a|ios)?\//i.test(ua)
    ? 'edge'
    : /firefox|fxios/i.test(ua)
      ? 'firefox'
      : /opr\/|opera|samsungbrowser|yabrowser/i.test(ua)
        ? 'otherBrowser'
        : /chrome|crios|chromium/i.test(ua)
          ? 'chrome'
          : /safari/i.test(ua)
            ? 'safari'
            : 'otherBrowser'

  return { deviceType: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop', os, browser }
}

/** SHA-256(deviceId) as hex, first 16 chars. Null where WebCrypto is unavailable (insecure origin). */
async function deviceHash(): Promise<string | null> {
  if (!crypto?.subtle) return null
  const bytes = new TextEncoder().encode(getDeviceId())
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
  return Array.from(digest.slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function trackVisit(): Promise<void> {
  const client = convexClient
  if (!client || ssGet(VISIT_TRACKED_KEY) === '1' || !navigator.onLine) return
  const hash = await deviceHash()
  if (!hash) return
  ssSet(VISIT_TRACKED_KEY, '1') // set first: one attempt per session, even if it fails
  await client.mutation(api.analytics.trackVisit, {
    deviceHash: hash,
    ...classifyDevice(),
    installed: isStandalone(),
    firstVisit: isNewDevice(),
  })
}

function countInstall(platform: 'ios' | 'android' | 'desktop'): void {
  const client = convexClient
  if (!client || lsGet(INSTALL_COUNTED_KEY) === '1') return
  lsSet(INSTALL_COUNTED_KEY, '1')
  client.mutation(api.analytics.trackInstall, { platform }).catch(() => { /* best effort */ })
}

export function initAnalytics(): void {
  if (!convexClient || typeof window === 'undefined') return

  window.addEventListener('appinstalled', () => countInstall(/android/i.test(navigator.userAgent) ? 'android' : 'desktop'))
  // iOS has no appinstalled event: count the first launch from the home screen
  if (isIOS() && isStandalone()) countInstall('ios')

  const run = () => void trackVisit().catch(() => { /* best effort */ })
  // After first paint, off the critical path; retried once if we start offline
  window.setTimeout(run, 1500)
  if (!navigator.onLine) window.addEventListener('online', run, { once: true })
}
