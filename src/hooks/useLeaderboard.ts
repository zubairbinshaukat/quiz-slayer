import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { convexEnabled } from '../lib/convex'
import { getDeviceId } from '../lib/deviceId'
import { DEMO_LEADERBOARD_DEFAULT, withDemoBoard } from '../lib/leaderboardDemo'
import { ensurePlayer, usePlayerSecret } from '../lib/identity'
import { previewRandomName } from '../lib/randomName'
import { accuracy, computePoints, MIN_ANSWERED_FOR_BOARD } from '../lib/ranking'
import { PLAYER_NAME_KEY } from '../lib/storageKeys'
import { useOnline } from './useOnline'
import { useQuizHistory } from './useQuizHistory'
import { NAME_PATTERN, NAME_RULE, normalizeName, type MeRow, type PlayerInfo, type Row, type UseLeaderboardResult } from './leaderboardTypes'
import type { HistoryEntry } from '../types'

const TOP_LIMIT = 50
/** How long the board may stay unloaded (while "online") before we call it unavailable. */
const LOAD_TIMEOUT_MS = 8000

function validName(raw: string): string {
  const name = normalizeName(raw)
  if (!NAME_PATTERN.test(name)) throw new Error(`Name must be ${NAME_RULE} only`)
  return name
}

// ─── Local fallback (no Convex configured) ──────────────────────────────────

function readStoredName(): string | null {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY)
  } catch {
    return null
  }
}

/** Aggregates local history the same way the server aggregates attempts. */
function meFromHistory(history: HistoryEntry[], id: string, name: string): MeRow | null {
  if (history.length === 0) return null
  let answered = 0
  let correct = 0
  let points = 0
  for (const e of history) {
    const a = e.answers.filter((x) => x !== null).length
    const wrong = Math.max(0, a - e.correct)
    answered += a
    correct += e.correct
    points += computePoints(e.correct, wrong, e.optionsCount ?? 4)
  }
  const qualified = answered >= MIN_ANSWERED_FOR_BOARD
  return {
    id,
    name,
    points: Math.round(points * 100) / 100,
    answered,
    correct,
    wrong: answered - correct,
    attempts: history.length,
    accuracy: accuracy(correct, answered),
    qualified,
    rank: qualified ? 1 : null,
  }
}

/** No backend: you are the whole board. */
function useLocalLeaderboard(): UseLeaderboardResult {
  const { history, loading } = useQuizHistory()
  const deviceId = useMemo(() => getDeviceId(), [])
  const [storedName, setStoredName] = useState<string | null>(readStoredName)

  const player = useMemo<PlayerInfo>(
    () => ({ name: storedName ?? previewRandomName(deviceId), nameChosen: storedName !== null }),
    [storedName, deviceId],
  )
  const me = useMemo(() => meFromHistory(history, deviceId, player.name), [history, deviceId, player.name])
  const top = useMemo<Row[]>(() => {
    if (!me?.qualified) return []
    const { id, name, points, answered, correct, accuracy: acc } = me
    return [{ id, name, points, answered, correct, accuracy: acc, rank: 1 }]
  }, [me])

  const setName = useCallback(async (raw: string) => {
    if (readStoredName() !== null) throw new Error('Name has already been chosen')
    const name = validName(raw)
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name)
    } catch { /* storage unavailable: keep for this session */ }
    setStoredName(name)
  }, [])

  // Nothing to create locally; the Convex branch registers the player.
  const ensure = useCallback(() => {}, [])

  return { enabled: false, loading, unavailable: false, top, me, player, setName, ensurePlayer: ensure }
}

// ─── Global board (Convex) ──────────────────────────────────────────────────

function toMeRow(me: FunctionReturnType<typeof api.leaderboard.me>): MeRow | null {
  if (!me) return null
  return { ...me, rank: me.qualified ? me.rank : null }
}

/** True once `active` has stayed true for `ms`. */
function useStalled(active: boolean, ms: number): boolean {
  const [stalled, setStalled] = useState(false)
  useEffect(() => {
    if (!active) return
    const t = window.setTimeout(() => setStalled(true), ms)
    return () => {
      window.clearTimeout(t)
      setStalled(false)
    }
  }, [active, ms])
  return active && stalled
}

function useConvexLeaderboard(): UseLeaderboardResult {
  const online = useOnline()
  const secret = usePlayerSecret()
  const deviceId = useMemo(() => getDeviceId(), [])

  // Live subscriptions: every change on the server re-renders automatically.
  const topLive = useQuery(api.leaderboard.top, online ? { limit: TOP_LIMIT } : 'skip')
  const meLive = useQuery(api.leaderboard.me, online && secret ? { secret } : 'skip')
  const playerLive = useQuery(api.players.me, online && secret ? { secret } : 'skip')
  const setNameMutation = useMutation(api.players.setName)

  const live = topLive !== undefined && (!secret || (meLive !== undefined && playerLive !== undefined))
  const stalled = useStalled(online && !live, LOAD_TIMEOUT_MS)

  const top = useMemo<Row[]>(() => topLive ?? [], [topLive])
  const me = useMemo(() => (meLive ? toMeRow(meLive) : null), [meLive])
  const player = useMemo<PlayerInfo>(
    () => (playerLive ? { name: playerLive.name, nameChosen: playerLive.nameChosen } : { name: previewRandomName(deviceId), nameChosen: false }),
    [playerLive, deviceId],
  )

  const ensure = useCallback(() => {
    void ensurePlayer()
  }, [])

  const setName = useCallback(
    async (raw: string) => {
      const name = validName(raw)
      if (!navigator.onLine) throw new Error("You're offline. Connect to the internet to choose a name.")
      const s = await ensurePlayer()
      if (!s) throw new Error('Could not reach the leaderboard. Try again.')
      try {
        await setNameMutation({ secret: s, name })
      } catch (err) {
        // ConvexError carries the server's validation message (taken / invalid / already chosen)
        throw new Error(err instanceof ConvexError ? String(err.data) : 'Could not reach the leaderboard. Try again.')
      }
    },
    [setNameMutation],
  )

  return {
    enabled: true,
    loading: online && !live,
    unavailable: !online || stalled,
    top,
    me,
    player,
    setName,
    ensurePlayer: ensure,
  }
}

/** The real board, or the fake demo board while the owner has it switched on (stats page). */
function useConvexLeaderboardWithDemo(): UseLeaderboardResult {
  const real = useConvexLeaderboard()
  const demo = useQuery(api.settings.get)?.demoLeaderboard ?? DEMO_LEADERBOARD_DEFAULT
  return demo ? withDemoBoard(real) : real
}

/** Leaderboard data source. Picked once per load (convexEnabled is a build-time constant). */
export const useLeaderboard: () => UseLeaderboardResult = convexEnabled ? useConvexLeaderboardWithDemo : useLocalLeaderboard
