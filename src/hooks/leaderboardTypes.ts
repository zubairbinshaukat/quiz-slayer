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
  /** Browser reports no connection */
  offline: boolean
  /** Showing the cached payload rather than live data */
  stale: boolean
  top: Row[]
  me: MeRow | null
  player: PlayerInfo | null
  /** Rejects with a user-facing message (taken / invalid / already chosen / offline). */
  setName: (name: string) => Promise<void>
  ensurePlayer: () => void
}

export const NAME_MIN = 2
export const NAME_MAX = 20
/** Same rule the server enforces in convex/players.ts */
export const NAME_PATTERN = /^[A-Za-z0-9 ]{2,20}$/
export const NAME_RULE = `${NAME_MIN}–${NAME_MAX} characters: letters, digits and spaces`

/** Trims and collapses inner whitespace. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}
