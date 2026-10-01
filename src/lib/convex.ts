import { ConvexReactClient } from 'convex/react'

/**
 * Convex configuration. The backend lives in /convex. When VITE_CONVEX_URL is
 * unset the app runs fully offline/local and no Convex client is created.
 */
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined

export const convexEnabled = Boolean(convexUrl)

/**
 * The single app-wide client: used by <MaybeConvexProvider> for hooks and
 * directly (client.mutation) by non-React code such as the attempt outbox.
 */
export const convexClient: ConvexReactClient | null = convexUrl ? new ConvexReactClient(convexUrl) : null

/**
 * Convex queues requests while its socket is down instead of failing, so a call
 * made while "online" but unable to connect would wait forever. Interactive
 * flows race it against a timeout and show an error instead.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e: unknown) => {
        clearTimeout(t)
        reject(e instanceof Error ? e : new Error(String(e)))
      },
    )
  })
}
