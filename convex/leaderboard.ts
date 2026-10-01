import { v } from 'convex/values'
import { query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { getPlayerBySecret, getStats } from './lib/playerStore'

/** Minimum answered questions before a player appears on the leaderboard. */
export const MIN_ANSWERED = 20

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

/** Accuracy as a percentage (0–100), 1 decimal place. */
function accuracyOf(stats: Pick<Doc<'playerStats'>, 'answered' | 'correct'>): number {
  if (stats.answered <= 0) return 0
  return Math.round((stats.correct / stats.answered) * 1000) / 10
}

export const top = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit ?? DEFAULT_LIMIT)))

    const stats = await ctx.db
      .query('playerStats')
      .withIndex('by_points')
      .order('desc')
      .filter((q) => q.gte(q.field('answered'), MIN_ANSWERED))
      .take(take)

    const rows = await Promise.all(
      stats.map(async (s) => {
        const player = await ctx.db.get(s.playerId)
        return {
          id: s.playerId as string,
          name: player?.name ?? 'Anonymous',
          points: s.points,
          answered: s.answered,
          correct: s.correct,
          accuracy: accuracyOf(s),
          attempts: s.attempts,
        }
      }),
    )

    // Tie-break: points desc, then accuracy desc, then fewer attempts first
    rows.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy || a.attempts - b.attempts)

    return rows.map(({ attempts: _attempts, ...row }, i) => ({ ...row, rank: i + 1 }))
  },
})

/** The caller's own stats and rank, or null if they have no ranked attempts. */
export const me = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    const player = await getPlayerBySecret(ctx, secret)
    if (!player) return null
    const stats = await getStats(ctx, player._id)
    if (!stats) return null

    const ahead = await ctx.db
      .query('playerStats')
      .withIndex('by_points', (q) => q.gt('points', stats.points))
      .filter((q) => q.gte(q.field('answered'), MIN_ANSWERED))
      .collect()

    return {
      id: player._id as string,
      name: player.name,
      points: stats.points,
      answered: stats.answered,
      correct: stats.correct,
      wrong: stats.wrong,
      attempts: stats.attempts,
      mastered: stats.mastered,
      accuracy: accuracyOf(stats),
      /** Whether the player has answered enough questions to appear on the board */
      qualified: stats.answered >= MIN_ANSWERED,
      rank: ahead.length + 1,
    }
  },
})
