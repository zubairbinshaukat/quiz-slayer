import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { convexEnabled } from '../lib/convex'
import { getDeviceId } from '../lib/deviceId'
import { readLeaderboardCache, writeLeaderboardCache } from '../lib/leaderboardCache'
import { previewRandomName } from '../lib/randomName'
import { accuracy, computePoints, MIN_ANSWERED_FOR_BOARD } from '../lib/ranking'
import { PLAYER_NAME_KEY } from '../lib/storageKeys'
import { useOnline } from './useOnline'
import { useQuizHistory } from './useQuizHistory'
import { NAME_PATTERN, NAME_RULE, normalizeName, type MeRow, type PlayerInfo, type Row, type UseLeaderboardResult } from './leaderboardTypes'
import type { HistoryEntry } from '../types'

const TOP_LIMIT = 50

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
function meFromHistory(history: HistoryEntry[], deviceId: string, name: string): MeRow | null {
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
    deviceId,
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

/** Offline fallback: you are the whole board. */
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
    const { deviceId: id, name, points, answered, correct, accuracy: acc } = me
    return [{ deviceId: id, name, points, answered, correct, accuracy: acc, rank: 1 }]
  }, [me])

  const setName = useCallback(async (raw: string) => {
    if (readStoredName() !== null) throw new Error('Name has already been chosen')
    const name = validName(raw)
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name)
    } catch { /* storage unavailable: keep for this session */ }
    setStoredName(name)
  }, [])

  // Nothing to create locally; the Convex branch registers the device.
  const ensurePlayer = useCallback(() => {}, [])

  return { enabled: false, loading, offline: false, stale: false, top, me, player, setName, ensurePlayer }
}

// ─── Global board (Convex) ──────────────────────────────────────────────────

function toMeRow(me: FunctionReturnType<typeof api.leaderboard.me>): MeRow | null {
  if (!me) return null
  return { ...me, rank: me.qualified ? me.rank : null }
}

function useConvexLeaderboard(): UseLeaderboardResult {
  const deviceId = useMemo(() => getDeviceId(), [])
  const online = useOnline()
  const [cache] = useState(readLeaderboardCache)

  // Live subscriptions: every change on the server re-renders automatically.
  const topLive = useQuery(api.leaderboard.top, { limit: TOP_LIMIT })
  const meLive = useQuery(api.leaderboard.me, { deviceId })
  const playerLive = useQuery(api.players.getPlayer, { deviceId })
  const ensureMutation = useMutation(api.players.ensurePlayer)
  const setNameMutation = useMutation(api.players.setName)

  const live = topLive !== undefined && meLive !== undefined && playerLive !== undefined

  const top = useMemo<Row[]>(() => topLive ?? cache?.top ?? [], [topLive, cache])
  const me = useMemo(() => (meLive !== undefined ? toMeRow(meLive) : (cache?.me ?? null)), [meLive, cache])
  const player = useMemo<PlayerInfo>(() => {
    if (playerLive) return { name: playerLive.name, nameChosen: playerLive.nameChosen }
    if (playerLive === undefined && cache?.player) return cache.player
    return { name: previewRandomName(deviceId), nameChosen: false }
  }, [playerLive, cache, deviceId])

  useEffect(() => {
    if (live) writeLeaderboardCache({ top, me, player })
  }, [live, top, me, player])

  const ensurePlayer = useCallback(() => {
    ensureMutation({ deviceId }).catch(() => { /* retried on next visit / flush */ })
  }, [ensureMutation, deviceId])

  const setName = useCallback(
    async (raw: string) => {
      const name = validName(raw)
      if (!navigator.onLine) throw new Error("You're offline. Connect to the internet to choose a name.")
      try {
        await ensureMutation({ deviceId })
        await setNameMutation({ deviceId, name })
      } catch (err) {
        // ConvexError carries the server's validation message (taken / invalid / already chosen)
        throw new Error(err instanceof ConvexError ? String(err.data) : 'Could not reach the leaderboard. Try again.')
      }
    },
    [ensureMutation, setNameMutation, deviceId],
  )

  return {
    enabled: true,
    loading: !live && !cache,
    offline: !online,
    stale: !live && cache !== null,
    top,
    me,
    player,
    setName,
    ensurePlayer,
  }
}

/** Leaderboard data source. Picked once per load (convexEnabled is a build-time constant). */
export const useLeaderboard: () => UseLeaderboardResult = convexEnabled ? useConvexLeaderboard : useLocalLeaderboard
