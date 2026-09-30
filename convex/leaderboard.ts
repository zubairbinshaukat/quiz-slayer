import { v } from 'convex/values'
import { query } from './_generated/server'
import type { Doc } from './_generated/dataModel'

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
        const player = await ctx.db
          .query('players')
          .withIndex('by_deviceId', (q) => q.eq('deviceId', s.deviceId))
          .unique()
        return {
          deviceId: s.deviceId,
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
    rows.sort(
      (a, b) =>
        b.points - a.points ||
        b.accuracy - a.accuracy ||
        a.attempts - b.attempts,
    )

    return rows.map(({ attempts: _attempts, ...row }, i) => ({ ...row, rank: i + 1 }))
  },
})

/** The caller's own stats and rank, or null if they have no recorded attempts. */
export const me = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    const stats = await ctx.db
      .query('playerStats')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
      .unique()
    if (!stats) return null

    const player = await ctx.db
      .query('players')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
      .unique()

    const ahead = await ctx.db
      .query('playerStats')
      .withIndex('by_points', (q) => q.gt('points', stats.points))
      .filter((q) => q.gte(q.field('answered'), MIN_ANSWERED))
      .collect()

    return {
      deviceId,
      name: player?.name ?? 'Anonymous',
      points: stats.points,
      answered: stats.answered,
      correct: stats.correct,
      wrong: stats.wrong,
      attempts: stats.attempts,
      accuracy: accuracyOf(stats),
      /** Whether the player has answered enough questions to appear on the board */
      qualified: stats.answered >= MIN_ANSWERED,
      rank: ahead.length + 1,
    }
  },
})
