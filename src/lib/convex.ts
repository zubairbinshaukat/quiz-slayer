import { ConvexReactClient } from 'convex/react'

/**
 * Convex configuration. The backend lives in /convex. When VITE_CONVEX_URL is
 * unset the app runs fully offline/local and no Convex client is created.
 */
export const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined

export const convexEnabled = Boolean(convexUrl)

/**
 * The single app-wide client: used by <MaybeConvexProvider> for hooks and
 * directly (client.mutation) by non-React code such as the attempt outbox.
 */
export const convexClient: ConvexReactClient | null = convexUrl ? new ConvexReactClient(convexUrl) : null
