import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Icon3D } from '../components/ui/Icon3D'
import { RELOADED_ONCE_KEY } from '../lib/storageKeys'

const CHUNK_ERROR = /dynamically imported module|Loading chunk|Failed to fetch/i

function errorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return error.message
  return String(error)
}

function reloadedOnce(): boolean {
  try {
    return sessionStorage.getItem(RELOADED_ONCE_KEY) === '1'
  } catch {
    return true // storage blocked: never loop
  }
}

/**
 * Root route errorElement. A stale deploy (old chunk names) reloads once automatically;
 * anything else, or a second failure, shows this screen.
 */
export function ErrorPage() {
  const error = useRouteError()
  const message = errorMessage(error)
  const autoReload = CHUNK_ERROR.test(message) && !reloadedOnce()

  useEffect(() => {
    if (!autoReload) return
    try {
      sessionStorage.setItem(RELOADED_ONCE_KEY, '1')
    } catch { /* ignore */ }
    window.location.reload()
  }, [autoReload])

  if (autoReload) return <main id="main" className="min-h-dvh" aria-busy="true" />

  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="card relative w-full max-w-[440px] overflow-hidden px-6 pt-8 pb-7 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_220px_at_50%_0%,rgb(255_107_94/0.16),transparent_70%)]"
        />
        <Icon3D name="puzzle" size={96} eager shadow className="relative mx-auto" />
        <p className="eyebrow relative mt-4">Error</p>
        <h1 className="relative mt-1 text-[28px] font-extrabold tracking-[-0.02em]">Something went wrong</h1>
        <p className="relative mx-auto mt-2 max-w-[34ch] text-sm text-muted">
          The page couldn't load. Reloading usually fixes it; your progress and history are safe on this device.
        </p>
        <p className="relative mx-auto mt-3 max-w-full truncate rounded-btn bg-surface-2 px-3 py-2 font-mono text-xs text-muted" title={message}>
          {message}
        </p>
        <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={() => window.location.reload()}>
            <Icon name="refresh" size={18} />
            Reload
          </Button>
          <a
            href="/"
            className="press inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-btn border border-line-strong px-5 font-semibold text-fg hover:bg-surface-2"
          >
            <Icon name="home" size={18} />
            Home
          </a>
        </div>
      </div>
    </main>
  )
}
