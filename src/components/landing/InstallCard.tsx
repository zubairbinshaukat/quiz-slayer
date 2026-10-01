import { useState, type CSSProperties, type ReactNode } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { INSTALL_DISMISSED_KEY } from '../../lib/storageKeys'
import { cn } from '../../lib/utils'
import { Button, IconButton } from '../ui/Button'
import { Icon, type IconName } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import { Sheet } from '../ui/Sheet'

const DISMISS_MS = 30 * 24 * 60 * 60 * 1000
const BENEFITS = ['Works fully offline', 'Opens instantly from your home screen', 'No app store, no account']

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(INSTALL_DISMISSED_KEY))
    return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_MS
  } catch {
    return false
  }
}

function IosStep({ n, icon, children }: { n: number; icon: IconName; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface-2 p-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">{n}</span>
      <span className="min-w-0 flex-1 text-[15px] leading-snug">{children}</span>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-btn border border-line bg-surface text-info" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
    </li>
  )
}

/** Dashboard "install the app" card (rail on desktop, under the hero on mobile). Hidden once installed or for 30 days after dismissal. */
export function InstallCard({ className }: { className?: string }) {
  const { canPrompt, installed, ios, prompt } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(recentlyDismissed)
  const [iosOpen, setIosOpen] = useState(false)

  if (installed || dismissed) return null

  function dismiss() {
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()))
    } catch { /* hide for this visit only */ }
    setDismissed(true)
  }

  return (
    <section
      aria-labelledby="install-heading"
      className={cn('card relative overflow-hidden p-5', className)}
      style={{ '--tint-h': 210 } as CSSProperties}
    >
      <div className="tint pointer-events-none absolute inset-0" aria-hidden="true" />
      <IconButton label="Dismiss install card for 30 days" onClick={dismiss} className="absolute right-1.5 top-1.5">
        <Icon name="close" size={18} />
      </IconButton>

      <div className="relative flex gap-4">
        <Icon3D name="rocket" size={60} eager shadow className="shrink-0" />
        <div className="min-w-0 flex-1 pr-8">
          <p className="eyebrow">Free app</p>
          <h2 id="install-heading" className="mt-0.5 text-lg font-bold">Install Quiz Slayer</h2>
          <ul className="mt-2 space-y-1">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <Icon name="check" size={16} strokeWidth={3} className="shrink-0 text-success" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mt-4">
        {canPrompt ? (
          // Any Chromium browser (Chrome, Edge, Brave, Opera, Samsung Internet) once beforeinstallprompt fired
          <Button className="w-full" onClick={() => void prompt()}>
            <Icon name="download" size={18} strokeWidth={2.5} />
            Install
          </Button>
        ) : ios ? (
          <Button className="w-full" onClick={() => setIosOpen(true)}>
            <Icon name="plusSquare" size={18} strokeWidth={2.5} />
            How to install
          </Button>
        ) : (
          // The prompt event may still arrive; the store re-renders this card into the Install button when it does
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="info" size={16} className="shrink-0" />
            Use your browser menu → Apps → Install Quiz Slayer
          </p>
        )}
      </div>

      <Sheet
        open={iosOpen}
        onClose={() => setIosOpen(false)}
        title="Add to your Home Screen"
        description="Two taps in Safari and Quiz Slayer opens like an app, even offline."
        footer={<Button className="w-full" onClick={() => setIosOpen(false)} data-autofocus>Got it</Button>}
      >
        <ol className="space-y-2.5">
          <IosStep n={1} icon="share">
            Tap <span className="font-semibold">Share</span> in the browser toolbar
          </IosStep>
          <IosStep n={2} icon="plusSquare">
            Choose <span className="font-semibold">Add to Home Screen</span>
          </IosStep>
        </ol>
      </Sheet>
    </section>
  )
}
