import { useRegisterSW } from 'virtual:pwa-register/react'
import { IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'

/** Small toast shown when a new service worker is waiting (registerType: 'prompt'). */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="card fixed inset-x-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[70] mx-auto flex max-w-sm animate-fade-up items-center gap-3 py-2 pl-4 pr-2 text-sm md:bottom-6"
    >
      <span className="flex-1 font-semibold">Update available</span>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="press min-h-10 rounded-btn bg-accent px-4 font-bold text-accent-ink hover:bg-accent-hover"
      >
        Reload
      </button>
      <IconButton label="Dismiss update notice" onClick={() => setNeedRefresh(false)}>
        <Icon name="close" size={18} />
      </IconButton>
    </div>
  )
}
