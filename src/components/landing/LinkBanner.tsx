import { useState } from 'react'
import { usePlayer } from '../../hooks/usePlayer'
import { openLinkSheet } from '../../lib/linkUi'
import { lsGet, lsSet } from '../../lib/storage'
import { LINK_BANNER_DISMISSED_KEY } from '../../lib/storageKeys'
import { IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'

/**
 * Mobile-only nudge for people who already play on another device. Shown while
 * this device is unlinked and has barely been used (< 2 local attempts).
 * Convex builds only.
 */
export function LinkBanner({ attempts }: { attempts: number }) {
  const { deviceCount } = usePlayer()
  const [dismissed, setDismissed] = useState(() => lsGet(LINK_BANNER_DISMISSED_KEY) === '1')

  if (dismissed || deviceCount >= 2 || attempts >= 2) return null

  function dismiss() {
    lsSet(LINK_BANNER_DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="card flex items-center gap-1 py-1 pr-1 pl-3.5 animate-fade-up md:hidden">
      <button
        type="button"
        onClick={() => openLinkSheet({ kind: 'join' })}
        className="press flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-left text-sm"
      >
        <Icon name="refresh" size={18} className="shrink-0 text-accent-fg" />
        <span className="min-w-0 flex-1">
          Used Quiz Slayer on your laptop? <span className="font-semibold text-accent-fg">Continue your progress here →</span>
        </span>
      </button>
      <IconButton label="Dismiss" onClick={dismiss}>
        <Icon name="close" size={16} />
      </IconButton>
    </div>
  )
}
