/**
 * Convex configuration. The backend lives in /convex; client usage of the
 * generated API is wired up in a later phase. When VITE_CONVEX_URL is unset
 * the app runs fully offline/local and no Convex client is created.
 */
export const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined

export const convexEnabled = Boolean(convexUrl)
