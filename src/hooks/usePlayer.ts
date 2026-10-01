import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { usePlayerSecret } from '../lib/identity'

export type PublicPlayer = NonNullable<FunctionReturnType<typeof api.players.me>>

export interface UsePlayerResult {
  /** undefined while loading, null when no server player exists yet */
  player: PublicPlayer | null | undefined
  /** 1 until linked (also before the player exists) */
  deviceCount: number
}

/** The server player for this device's secret. Convex builds only (needs ConvexProvider). */
export function usePlayer(): UsePlayerResult {
  const secret = usePlayerSecret()
  const player = useQuery(api.players.me, secret ? { secret } : 'skip')
  return { player: secret ? player : null, deviceCount: player?.deviceCount ?? 1 }
}
