import { LEADERBOARD_CACHE_KEY } from './storageKeys'
import { isRecord } from '../types'
import type { MeRow, PlayerInfo, Row } from '../hooks/leaderboardTypes'

/** Last live leaderboard payload, so the page can render offline. */
export interface LeaderboardCache {
  top: Row[]
  me: MeRow | null
  player: PlayerInfo | null
  savedAt: number
}

export function readLeaderboardCache(): LeaderboardCache | null {
  try {
    const raw = localStorage.getItem(LEADERBOARD_CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.top)) return null
    // Written by this app from validated server data
    return {
      top: parsed.top as Row[],
      me: isRecord(parsed.me) ? (parsed.me as unknown as MeRow) : null,
      player: isRecord(parsed.player) ? (parsed.player as unknown as PlayerInfo) : null,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
    }
  } catch {
    return null
  }
}

export function writeLeaderboardCache(data: Omit<LeaderboardCache, 'savedAt'>): void {
  try {
    localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }))
  } catch { /* storage full or unavailable */ }
}
