// TODO(owner): remove demo data — set DEMO_LEADERBOARD to false (or delete this file and its one
// import in hooks/useLeaderboard.ts) to restore the real board. Dev builds only: production never shows it.
import type { MeRow, PlayerInfo, Row, UseLeaderboardResult } from '../hooks/leaderboardTypes'

export const DEMO_LEADERBOARD = true

/** Active only in `vite dev` with the flag on. */
export const demoLeaderboardActive = import.meta.env.DEV && DEMO_LEADERBOARD

const YOU_RANK = 6

/** [name, points, answered, accuracy %] — fake, for design review only. */
const DEMO: [string, number, number, number][] = [
  ['Swift Fox 27', 61.33, 132, 78.8],
  ['Mighty Panda 41', 54.67, 118, 80.5],
  ['Quiet Lynx 18', 49.0, 140, 68.6],
  ['Bold Otter 51', 44.33, 96, 83.3],
  ['Cosmic Tiger 73', 41.67, 104, 75.0],
  // rank 6 = you
  ['Clever Heron 12', 33.0, 88, 71.6],
  ['Brave Panda 33', 28.67, 70, 80.0],
  ['Jolly Penguin 58', 24.0, 64, 75.0],
  ['Lucky Gecko 90', 19.33, 58, 70.7],
  ['Calm Badger 17', 15.67, 52, 67.3],
  ['Rapid Koala 44', 11.0, 40, 70.0],
  ['Nimble Wolf 16', 8.33, 34, 61.8],
  ['Gentle Yak 72', 6.0, 26, 57.7],
  ['Witty Crane 29', 4.0, 20, 45.0],
]

function row(name: string, points: number, answered: number, acc: number, rank: number, id = `demo-${rank}`): Row {
  return { id, name, points, answered, correct: Math.round((answered * acc) / 100), accuracy: acc, rank }
}

/** Real hook result with the demo board swapped in; "you" (real id + name) sits at rank 6. */
export function withDemoBoard(real: UseLeaderboardResult): UseLeaderboardResult {
  const player: PlayerInfo = real.player ?? { name: 'You', nameChosen: false }
  const youId = real.me?.id ?? 'demo-you'
  const you = row(player.name, 37.33, 92, 76.1, YOU_RANK, youId)
  const top: Row[] = []
  let rank = 1
  for (const [name, points, answered, acc] of DEMO) {
    if (rank === YOU_RANK) top.push({ ...you, rank: rank++ })
    top.push(row(name, points, answered, acc, rank++))
  }
  const me: MeRow = { ...you, wrong: you.answered - you.correct, attempts: 11, qualified: true, rank: YOU_RANK }
  return { ...real, enabled: true, loading: false, unavailable: false, top, me, player }
}
