const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'short' })

/** "3 hr. ago", "yesterday", "just now". */
export function timeAgo(ms: number | null, now = Date.now()): string {
  if (!ms) return 'never'
  const diff = ms - now
  for (const [unit, size] of UNITS) {
    if (Math.abs(diff) >= size) return rtf.format(Math.round(diff / size), unit)
  }
  return 'just now'
}

const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export const formatDate = (ms: number) => dateFmt.format(ms)
export const formatDateTime = (ms: number) => dateTimeFmt.format(ms)

const OS = { ios: 'iOS', android: 'Android', windows: 'Windows', mac: 'macOS', linux: 'Linux', otherOs: 'Other OS' } as const
const BROWSER = { chrome: 'Chrome', safari: 'Safari', firefox: 'Firefox', edge: 'Edge', otherBrowser: 'Other browser' } as const
const TYPE = { mobile: 'Phone', tablet: 'Tablet', desktop: 'Computer' } as const

export interface DeviceInfo {
  deviceType: keyof typeof TYPE
  os: keyof typeof OS
  browser: keyof typeof BROWSER
  installed: boolean
}

/** "Phone · Android · Chrome", or null before the device has reported (pre-update attempts). */
export function deviceLabel(info: DeviceInfo | null): string | null {
  if (!info) return null
  return `${TYPE[info.deviceType]} · ${OS[info.os]} · ${BROWSER[info.browser]}`
}

/** Signed points: "+3", "−0.67", "0". */
export function signedPoints(n: number): string {
  const r = Math.round(n * 100) / 100
  const abs = Math.abs(r).toFixed(2).replace(/\.?0+$/, '')
  return r > 0 ? `+${abs}` : r < 0 ? `−${abs}` : '0'
}
