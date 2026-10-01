import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from '../../hooks/useTheme'
import { isLiteActive } from '../../lib/liteMode'
import { cn } from '../../lib/utils'
import { prefersReducedMotion } from '../../lib/viewTransition'
import { Icon } from '../ui/Icon'

/**
 * Sun/moon toggle that sits right beside the Settings gear. Both glyphs share one fixed box and
 * cross-rotate (200ms) so nothing shifts. The new theme is revealed as a circle growing from the
 * click point (View Transitions); lite mode / reduced motion / no support switch instantly.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setPref } = useTheme()
  const dark = theme === 'dark'

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    const next = dark ? 'light' : 'dark'
    if (typeof document.startViewTransition !== 'function' || isLiteActive() || prefersReducedMotion()) {
      setPref(next)
      return
    }
    const root = document.documentElement
    // Keyboard activation has no pointer position: grow from the button's centre
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.detail === 0 ? box.left + box.width / 2 : e.clientX
    const y = e.detail === 0 ? box.top + box.height / 2 : e.clientY
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.classList.add('theme-reveal')
    const transition = document.startViewTransition(() => {
      root.classList.toggle('dark', next === 'dark')
      flushSync(() => setPref(next))
    })
    transition.ready.catch(() => {})
    void transition.finished.finally(() => root.classList.remove('theme-reveal'))
  }

  const glyph = 'absolute inset-0 m-auto transition-[rotate,scale,opacity] duration-200 ease-out'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={cn(
        'press group relative inline-flex size-11 shrink-0 items-center justify-center rounded-btn text-muted hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      <span className="relative block size-5" aria-hidden="true">
        <Icon name="sun" className={cn(glyph, dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0')} />
        <Icon name="moon" className={cn(glyph, dark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
      </span>
    </button>
  )
}
