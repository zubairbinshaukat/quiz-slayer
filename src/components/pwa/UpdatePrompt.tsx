import { useRegisterSW } from 'virtual:pwa-register/react'

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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl
                 bg-surface-card border border-themed-border shadow-modal text-sm text-content-primary animate-fade-up"
    >
      <span className="font-semibold">Update available</span>
      <button
        onClick={() => void updateServiceWorker(true)}
        className="px-3 py-1.5 rounded-xl bg-themed-accent hover:bg-themed-accent-hover text-white font-bold transition-colors"
      >
        Reload
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss update notice"
        className="p-1 rounded-lg text-content-secondary hover:text-content-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
