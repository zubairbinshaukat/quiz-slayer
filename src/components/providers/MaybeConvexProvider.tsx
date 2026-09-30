import type { ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { convexEnabled, convexUrl } from '../../lib/convex'

const convexClient = convexEnabled && convexUrl ? new ConvexReactClient(convexUrl) : null

/** Wraps children in ConvexProvider only when VITE_CONVEX_URL is configured. */
export function MaybeConvexProvider({ children }: { children: ReactNode }) {
  if (!convexClient) return <>{children}</>
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
