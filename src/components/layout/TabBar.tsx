import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCompactOnScroll } from '../../hooks/useCompactOnScroll'
import { useLiteMode } from '../../hooks/useLiteMode'
import { haptic } from '../../lib/haptics'
import { cn } from '../../lib/utils'
import { NAV_ITEMS } from './navItems'

/** Bold tab glyphs (stroke 2.25 + filled details); `active` adds a soft fill. */
function TabGlyph({ kind, active }: { kind: 'home' | 'history'; active: boolean }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.25, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      {kind === 'home' ? (
        <>
          <path {...common} fill="currentColor" fillOpacity={active ? 0.22 : 0} d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" />
          <path fill="currentColor" d="M9.6 20.5v-4.6a1.1 1.1 0 0 1 1.1-1.1h2.6a1.1 1.1 0 0 1 1.1 1.1v4.6z" />
        </>
      ) : (
        <>
          <circle cx="12.5" cy="12.5" r="8" fill="currentColor" fillOpacity={active ? 0.22 : 0} />
          <path {...common} d="M4.2 12.5a8.3 8.3 0 1 0 2.43-5.87L4.2 9.1" />
          <path {...common} d="M4.2 4.6v4.5h4.5" />
          <path {...common} d="M12.5 8.4v4.4l2.9 1.8" />
        </>
      )}
    </svg>
  )
}

const PRESS = 'transition-transform duration-150 active:scale-[0.94]'

/**
 * Mobile floating tab bar (hidden from md up and on /quiz/*). Home and History sit either side of a
 * raised 60px amber Leaderboard button with the 3D trophy; an amber dot slides under the active item.
 */
export function TabBar() {
  const { pathname } = useLocation()
  const { lite } = useLiteMode()
  const activeIndex = NAV_ITEMS.findIndex((t) => t.match(pathname))

  const compact = useCompactOnScroll()

  // Publish the bar's footprint (--tabbar-height via html.has-tabbar / .tabbar-compact) for fixed elements above it
  useEffect(() => {
    document.documentElement.classList.add('has-tabbar')
    return () => document.documentElement.classList.remove('has-tabbar', 'tabbar-compact')
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('tabbar-compact', compact)
  }, [compact])

  return (
    <nav
      aria-label="Main"
      data-compact={compact || undefined}
      className="tabbar pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pt-5 pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden [view-transition-name:tabbar]"
    >
      <ul className="pointer-events-auto relative mx-auto grid h-16 max-w-[420px] grid-cols-3 rounded-full border border-line-strong bg-surface-2 shadow-[var(--hl),var(--float)]">
        {activeIndex >= 0 && activeIndex !== 1 && (
          <span
            aria-hidden="true"
            className="tab-dot absolute bottom-[4px] size-1 -translate-x-1/2 rounded-full bg-accent"
            style={{ left: `${((activeIndex + 0.5) / NAV_ITEMS.length) * 100}%` }}
          />
        )}
        {NAV_ITEMS.map((tab, i) => {
          const active = i === activeIndex
          const centre = i === 1
          return (
            <li key={tab.to} className="relative">
              <Link
                to={tab.to}
                viewTransition={!lite}
                aria-current={active ? 'page' : undefined}
                onClick={() => haptic('tap')}
                className={cn(
                  'flex h-full flex-col items-center rounded-full text-[11px] font-semibold leading-none',
                  centre ? 'justify-start pt-[48px]' : cn('justify-center gap-1 pb-1', PRESS),
                  active ? (centre ? 'text-fg' : 'text-accent-fg') : 'text-muted hover:text-fg',
                )}
              >
                {centre ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -top-[18px] left-1/2 flex size-[60px] -translate-x-1/2 items-center justify-center overflow-visible rounded-full',
                      'border-4 border-bg bg-[radial-gradient(circle_at_35%_30%,#ffd27a,#f5b73a_55%,#d9921c)] shadow-[0_10px_28px_-6px_rgb(245_183_58/0.65)]',
                      PRESS,
                    )}
                  >
                    <img
                      src="/icons3d/trophy-gold@1x.webp"
                      srcSet="/icons3d/trophy-gold@1x.webp 1x, /icons3d/trophy-gold.webp 2x"
                      width={34}
                      height={34}
                      alt=""
                      draggable={false}
                      className="size-[34px] object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]"
                    />
                  </span>
                ) : (
                  <TabGlyph kind={tab.icon === 'home' ? 'home' : 'history'} active={active} />
                )}
                <span className={cn('tab-label', active && !centre && 'text-fg')}>{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
