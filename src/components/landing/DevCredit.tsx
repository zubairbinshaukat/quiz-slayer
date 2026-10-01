import { DEV_LINKS, DEV_NAME, DEV_SITE_URL } from '../../lib/links'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import { ZubyrMark } from '../brand/ZubyrMark'

/** Credit card at the bottom of the dashboard (end of the right rail on desktop). The card links to the portfolio. */
export function DevCredit({ className }: { className?: string }) {
  return (
    <footer className={cn('credit-card card hover-lift relative p-5 hover:border-line-strong', className)} aria-label="Credits">
      <span className="credit-sheen" aria-hidden="true" />
      {/* Stretched link: the whole card opens the portfolio; the pills sit above it (z-10) */}
      <a
        href={DEV_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-[1] rounded-card"
        aria-label={`${DEV_NAME} — portfolio (opens in a new tab)`}
      />
      <Icon3D name="magic-trick" size={72} shadow className="pointer-events-none absolute -top-5 -right-2" />

      <div className="pointer-events-none relative flex items-center gap-4">
        <ZubyrMark size={44} className="shrink-0 text-fg" />
        <div className="min-w-0 flex-1 pr-12">
          <p className="eyebrow">Built by</p>
          <p className="font-display mt-0.5 truncate text-[18px] font-extrabold leading-tight tracking-[-0.02em]">{DEV_NAME}</p>
          <p className="mt-0.5 truncate text-[13px] text-muted">Designed &amp; built Quiz Slayer</p>
        </div>
      </div>

      {/* [ Portfolio ──── ↗ ] [GH] [in] */}
      <nav aria-label="Developer links" className="relative mt-4 flex gap-2">
        {DEV_LINKS.map((link) => {
          const primary = link.icon === 'user'
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${link.label} (opens in a new tab)`}
              title={primary ? undefined : link.label}
              className={cn(
                'hover-lift relative z-10 inline-flex h-11 items-center rounded-[14px] active:scale-[0.98]',
                primary
                  ? 'min-w-0 flex-1 gap-2 bg-accent/12 px-3.5 text-sm font-bold text-accent-fg shadow-[0_6px_18px_-10px_rgb(245_183_58/0.55)] hover:bg-accent/20 [:root:not(.dark)_&]:bg-accent/18 [:root:not(.dark)_&]:hover:bg-accent/25'
                  : 'w-11 shrink-0 justify-center border border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg',
              )}
            >
              <Icon name={link.icon} size={primary ? 17 : 18} className="shrink-0" />
              {primary && (
                <>
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                  <Icon name="arrowUpRight" size={16} strokeWidth={2.5} className="shrink-0" />
                </>
              )}
            </a>
          )
        })}
      </nav>
    </footer>
  )
}
