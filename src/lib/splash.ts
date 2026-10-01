import { isLiteActive } from './liteMode'
import { prefersReducedMotion } from './viewTransition'

declare global {
  interface Window {
    /** performance.now() when the splash logo started its entrance (set inline in index.html). */
    __splashIn?: number
  }
}

/** The logo finishes its entrance (focus-in, settle, glint under way) before it flies. */
const INTRO_MS = 1100
/** Never hold the splash longer than this for fonts or the navbar logo to decode. */
const WAIT_CAP_MS = 1200
const FLY_MS = 820
/** Replays (in-app arrivals on home) run a shorter cut: index.html `#splash.replay`. */
const REPLAY_INTRO_MS = 620
const REPLAY_FLY_MS = 720
// X lags Y, so the logo lifts first and then swings across: a short arc instead of a straight line
const EASE_X = 'cubic-bezier(0.55, 0, 0.15, 1)'
const EASE_Y = 'cubic-bezier(0.3, 0, 0.1, 1)'
const EASE_FADE = 'cubic-bezier(0.4, 0, 0.2, 1)'

let released = false
let playing = false

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const getSplash = () => document.getElementById('splash')

/** The chrome logo the splash lands on: Navbar (<lg) or Sidebar (lg+), whichever is on screen. */
function findTarget(): HTMLImageElement | null {
  for (const el of document.querySelectorAll<HTMLImageElement>('header .logo-mark, aside .logo-mark')) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) return el
  }
  return null
}

function introDone(): Promise<void> {
  const start = window.__splashIn
  return start === undefined ? Promise.resolve() : sleep(start + INTRO_MS - performance.now())
}

/**
 * Hide the splash (kept in the DOM for replays). The real logo is revealed in the same frame:
 * the flown copy sits exactly on top of it, so the swap is invisible. Animations are reset while
 * hidden, so the next replay starts from the CSS resting state.
 */
function finish(splash: HTMLElement) {
  document.documentElement.classList.remove('splash', 'splash-still')
  splash.classList.remove('replay')
  for (const animation of splash.getAnimations({ subtree: true })) animation.cancel()
  playing = false
}

function fadeOut(splash: HTMLElement) {
  splash.style.pointerEvents = 'none'
  if (typeof splash.animate !== 'function') return finish(splash)
  splash
    .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' })
    .finished.then(() => finish(splash), () => finish(splash))
}

/** FLIP: measure both logos, then animate the splash copy onto the chrome one (transform only). */
function fly(splash: HTMLElement, target: HTMLImageElement | null, duration: number) {
  const $ = (sel: string) => splash.querySelector<HTMLElement>(sel)
  const logo = $('.s-art'), fx = $('.s-fly'), fy = $('.s-fly-y'), bg = $('.s-bg'), glow = $('.s-glow')
  if (!logo || !fx || !fy || !bg || !glow) return finish(splash)
  splash.style.pointerEvents = 'none' // the page is usable while the logo is still in the air

  const dark = document.documentElement.classList.contains('dark')
  bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration * 0.68, delay: 120, easing: EASE_FADE, fill: 'forwards' })
  glow.animate([{ opacity: 0.85, transform: 'scale(1.03)' }, { opacity: 0, transform: 'scale(1.9)' }], {
    duration: 560,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'forwards',
  })
  for (const el of splash.querySelectorAll<HTMLElement>('.s-ring, .s-bar')) {
    el.animate([{ opacity: 0 }], { duration: 160, fill: 'forwards' })
  }

  // No chrome logo on screen (quiz focus mode, scrolled away): zoom through instead of flying
  if (!target) {
    fy.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(1.12)', opacity: 0 }], {
      duration: 480,
      easing: EASE_FADE,
      fill: 'forwards',
    }).finished.then(() => finish(splash), () => finish(splash))
    return
  }

  const from = logo.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const scale = to.height / from.height
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const timing = { duration, fill: 'forwards' } as const

  fx.animate([{ transform: 'none' }, { transform: `translateX(${dx}px)` }], { ...timing, easing: EASE_X })
  // The deep splash shadow turns into the chrome logo's amber halo (index.css .dark .logo-mark, 7px).
  // The blur happens before the scale, so it is divided by the scale to land at 7px on screen.
  logo.animate(
    dark
      ? [{ filter: 'blur(0px) drop-shadow(0 18px 24px rgb(0 0 0 / 0.45))' }, { filter: `blur(0px) drop-shadow(0 0 ${7 / scale}px rgb(245 183 58 / 0.4))` }]
      : [{ filter: 'blur(0px) drop-shadow(0 16px 20px rgb(60 45 20 / 0.25))' }, { filter: 'blur(0px) drop-shadow(0 0 0 rgb(60 45 20 / 0))' }],
    { ...timing, easing: 'ease-out' },
  )
  fy.animate([{ transform: 'none' }, { transform: `translateY(${dy}px) scale(${scale})` }], { ...timing, easing: EASE_Y })
    .finished.then(() => finish(splash), () => finish(splash))
}

/**
 * Hands over from the inline splash (index.html, shown on every full page load) to the app. Call once
 * the shell has rendered real content; safe to call repeatedly. Waits for fonts and the chrome logo
 * (capped) so nothing swaps after the reveal, lets the logo finish its entrance, then flies it into place.
 */
export function releaseSplash(): void {
  if (released) return
  released = true
  const splash = getSplash()
  const root = document.documentElement
  if (!splash || !root.classList.contains('splash')) return

  // Back from another site (bfcache restore) onto home: play it again
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && window.location.pathname === '/') replaySplash()
  })

  playing = true
  void (async () => {
    await nextFrame()
    const target = findTarget()
    await Promise.race([Promise.all([document.fonts?.ready, target?.decode().catch(() => {})]), sleep(WAIT_CAP_MS)])
    // Still frame (lite / reduced motion), or the logo never arrived: a plain cross-fade
    if (root.classList.contains('splash-still') || prefersReducedMotion() || !splash.classList.contains('in')) return fadeOut(splash)
    await introDone()
    fly(splash, findTarget(), FLY_MS)
  })()
}

/**
 * The short cut for arriving on home inside the app (back button, logo, Home tab): the backdrop fades
 * in over the page, the logo focuses and glints, then flies back to its place. Taps pass through it.
 * Skipped in lite mode and for reduced motion.
 */
export function replaySplash(): void {
  const splash = getSplash()
  if (!released || playing || !splash || isLiteActive() || prefersReducedMotion()) return
  const bg = splash.querySelector<HTMLElement>('.s-bg')
  if (!bg || typeof bg.animate !== 'function') return
  playing = true
  splash.style.pointerEvents = 'none'
  splash.classList.add('in', 'replay')
  // display:none → grid restarts every CSS animation in it (glow bloom, focus-in, ring, glint)
  document.documentElement.classList.add('splash')
  bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' })
  void sleep(REPLAY_INTRO_MS).then(() => fly(splash, findTarget(), REPLAY_FLY_MS))
}
