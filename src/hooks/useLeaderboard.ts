import { useCallback, useMemo, useState } from 'react'
import { convexEnabled } from '../lib/convex'
import { getDeviceId } from '../lib/deviceId'
import { previewRandomName } from '../lib/randomName'
import { accuracy, computePoints, MIN_ANSWERED_FOR_BOARD } from '../lib/ranking'
import { useQuizHistory } from './useQuizHistory'
import { NAME_MAX, NAME_MIN, type MeRow, type PlayerInfo, type Row, type UseLeaderboardResult } from './leaderboardTypes'
import type { HistoryEntry } from '../types'

export const PLAYER_NAME_KEY = 'qs-player-name'

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

  const setName = useCallback(async (name: string) => {
    const clean = name.trim().replace(/\s+/g, ' ')
    if (clean.length < NAME_MIN || clean.length > NAME_MAX) throw new Error(`Name must be ${NAME_MIN}–${NAME_MAX} characters`)
    try {
      localStorage.setItem(PLAYER_NAME_KEY, clean)
    } catch { /* storage unavailable: keep for this session */ }
    setStoredName(clean)
  }, [])

  // Nothing to create locally; the Convex branch registers the device.
  const ensurePlayer = useCallback(() => {}, [])

  return { enabled: false, loading, top, me, player, setName, ensurePlayer }
}

function useConvexLeaderboard(): UseLeaderboardResult {
  // TODO(phase3): Convex implementation.
  //   top    ← useQuery(api.leaderboard.top, { limit: 50 })
  //   me     ← useQuery(api.leaderboard.me, { deviceId })
  //   player ← useQuery(api.players.get, { deviceId })
  //   setName / ensurePlayer ← useMutation(api.players.setName / api.players.ensure)
  // Until then, mirror the local board so the UI keeps working.
  return useLocalLeaderboard()
}

/** Leaderboard data source. Picked once per load (convexEnabled is a build-time constant). */
export const useLeaderboard: () => UseLeaderboardResult = convexEnabled ? useConvexLeaderboard : useLocalLeaderboard
