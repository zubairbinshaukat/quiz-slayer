import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from 'lenis/react'
import { cn } from '../../lib/utils'
import { IconButton } from './Button'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  /** Pinned action row (safe-area padded on mobile). */
  footer?: ReactNode
  className?: string
  /** Hide the close button (still closes on Esc / backdrop unless `dismissible` is false). */
  hideClose?: boolean
  dismissible?: boolean
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/** Bottom sheet on mobile, centred dialog from md up. Portalled, focus-trapped, scroll-locked. */
export function Sheet({ open, onClose, title, description, children, footer, className, hideClose, dismissible = true }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const lenis = useLenis()
  const closeRef = useRef(onClose)
  const dismissRef = useRef(dismissible)

  useEffect(() => {
    closeRef.current = onClose
    dismissRef.current = dismissible
  })

  // Esc, focus in/out, body scroll lock
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const auto = panel?.querySelector<HTMLElement>('[data-autofocus]')
    ;(auto ?? panel)?.focus({ preventScroll: true })

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && dismissRef.current) {
        e.stopPropagation()
        closeRef.current()
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.({ preventScroll: true })
    }
  }, [open])

  // Pause smooth scrolling underneath the sheet
  useEffect(() => {
    if (!open || !lenis) return
    lenis.stop()
    return () => {
      // Lite mode can destroy Lenis while a sheet is open (destroy() strips the root
      // `lenis` class); restarting a destroyed instance would re-add its classes.
      if (document.documentElement.classList.contains('lenis')) lenis.start()
    }
  }, [open, lenis])

  function trapTab(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" data-lenis-prevent>
      <div
        className="absolute inset-0 animate-fade-in bg-[var(--scrim)]"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        className={cn(
          'relative flex max-h-[88dvh] w-full flex-col overflow-hidden border border-line bg-surface outline-none',
          'rounded-t-sheet animate-sheet-up md:max-w-[440px] md:rounded-sheet md:animate-pop',
          'shadow-[var(--hl),var(--float)]',
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden="true" />
        {(title || !hideClose) && (
          <div className="flex shrink-0 items-start gap-3 px-5 pt-3 md:pt-5">
            <div className="min-w-0 flex-1 pt-2">
              {title && <h2 id={titleId} className="text-lg">{title}</h2>}
              {description && <p id={descId} className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {!hideClose && dismissible && (
              <IconButton label="Close" onClick={onClose} className="-mr-2">
                <Icon name="close" />
              </IconButton>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-3" data-lenis-prevent>
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-line px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] md:pb-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
