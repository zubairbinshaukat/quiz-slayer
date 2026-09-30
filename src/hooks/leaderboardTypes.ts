/** Public leaderboard shapes (mirrors convex/leaderboard.ts query results). */

export interface Row {
  deviceId: string
  name: string
  points: number
  answered: number
  correct: number
  /** 0–100, 1 dp */
  accuracy: number
  rank: number
}

export interface MeRow extends Omit<Row, 'rank'> {
  wrong: number
  attempts: number
  /** Answered at least MIN_ANSWERED_FOR_BOARD questions */
  qualified: boolean
  /** Null until qualified */
  rank: number | null
}

export interface PlayerInfo {
  name: string
  /** True once the player picked their own name */
  nameChosen: boolean
}

export interface UseLeaderboardResult {
  /** True when backed by the global (Convex) board */
  enabled: boolean
  loading: boolean
  top: Row[]
  me: MeRow | null
  player: PlayerInfo | null
  setName: (name: string) => Promise<void>
  ensurePlayer: () => void
}

export const NAME_MIN = 2
export const NAME_MAX = 20
