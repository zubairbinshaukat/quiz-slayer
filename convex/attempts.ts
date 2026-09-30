import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { attemptMode } from './schema'

const MAX_QUESTIONS_PER_ATTEMPT = 500

/** Rounds to 2 decimal places. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Negative-marking score: each wrong answer costs 1/(optionsCount-1) of a point,
 * so random guessing has an expected value of zero.
 */
export function attemptPoints(correct: number, wrong: number, optionsCount: number): number {
  return correct - wrong / (optionsCount - 1)
}

/** Records a finished attempt and updates the player's aggregate stats. Retry attempts count too. */
export const recordAttempt = mutation({
  args: {
    deviceId: v.string(),
    slug: v.string(),
    subject: v.string(),
    mode: attemptMode,
    answers: v.array(v.union(v.number(), v.null())),
    correctIds: v.array(v.string()),
    wrongIds: v.array(v.string()),
    optionsCount: v.number(),
    timeTaken: v.number(),
  },
  handler: async (ctx, args) => {
    const { deviceId, answers, correctIds, wrongIds, optionsCount } = args

    if (deviceId.length < 8 || deviceId.length > 128) throw new ConvexError('Invalid device id')
    if (!Number.isInteger(optionsCount) || optionsCount < 2 || optionsCount > 10) {
      throw new ConvexError('optionsCount must be an integer between 2 and 10')
    }
    if (answers.length === 0 || answers.length > MAX_QUESTIONS_PER_ATTEMPT) {
      throw new ConvexError('Invalid number of answers')
    }
    if (correctIds.length + wrongIds.length > answers.length) {
      throw new ConvexError('More graded questions than answers')
    }
    if (!Number.isFinite(args.timeTaken) || args.timeTaken < 0) {
      throw new ConvexError('Invalid timeTaken')
    }

    const answered = answers.filter((a) => a !== null).length
    const correct = correctIds.length
    const wrong = wrongIds.length
    const now = Date.now()

    const attemptId = await ctx.db.insert('attempts', {
      ...args,
      answered,
      correct,
      wrong,
      createdAt: now,
    })

    const points = attemptPoints(correct, wrong, optionsCount)

    const stats = await ctx.db
      .query('playerStats')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
      .unique()

    if (stats) {
      await ctx.db.patch(stats._id, {
        answered: stats.answered + answered,
        correct: stats.correct + correct,
        wrong: stats.wrong + wrong,
        points: round2(stats.points + points),
        attempts: stats.attempts + 1,
        lastActiveAt: now,
      })
    } else {
      await ctx.db.insert('playerStats', {
        deviceId,
        answered,
        correct,
        wrong,
        points: round2(points),
        attempts: 1,
        lastActiveAt: now,
      })
    }

    return { attemptId, points: round2(points) }
  },
})
