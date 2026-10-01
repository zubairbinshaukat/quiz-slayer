import type { ReactNode } from 'react'
import { ConvexProvider } from 'convex/react'
import { convexClient } from '../../lib/convex'

/** Wraps children in ConvexProvider only when VITE_CONVEX_URL is configured. */
export function MaybeConvexProvider({ children }: { children: ReactNode }) {
  if (!convexClient) return <>{children}</>
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
