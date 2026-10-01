import { ConvexError, v } from 'convex/values'
import { mutation, type MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { attemptMode } from './schema'
import { ensurePlayerRow, getStats } from './lib/playerStore'
import { assertDeviceId, assertSecret, round2 } from './lib/util'

const MAX_QUESTIONS_PER_ATTEMPT = 500

interface Grade {
  answered: number
  correct: number
  wrong: number
  newlyMastered: number
  points: number
}

/**
 * Grades answers against the server's answer key.
 *  - correct: +1 only the first time this player answers that question correctly
 *    (a playerMastery row is inserted); later correct answers earn nothing.
 *  - wrong: −1/(optionsCount−1) every time, so guessing has an expected value ≤ 0.
 *  - unanswered, unknown ids and repeated ids within one attempt: ignored.
 */
async function grade(
  ctx: MutationCtx,
  playerId: Id<'players'>,
  bank: Doc<'questionBanks'>,
  answers: (number | null)[],
  questionIds: string[],
): Promise<Grade> {
  const key = new Map(bank.questions.map((q) => [q.id, q]))
  const seen = new Set<string>()
  const g: Grade = { answered: 0, correct: 0, wrong: 0, newlyMastered: 0, points: 0 }

  for (let i = 0; i < questionIds.length; i++) {
    const answer = answers[i]
    const id = questionIds[i]
    const q = key.get(id)
    if (answer === null || !q || seen.has(id)) continue
    seen.add(id)
    g.answered++

    if (answer === q.correctIndex) {
      g.correct++
      const questionKey = `${bank.slug}:${id}`
      const mastered = await ctx.db
        .query('playerMastery')
        .withIndex('by_player_question', (m) => m.eq('playerId', playerId).eq('questionKey', questionKey))
        .unique()
      if (!mastered) {
        await ctx.db.insert('playerMastery', { playerId, questionKey })
        g.newlyMastered++
        g.points += 1
      }
    } else {
      g.wrong++
      g.points -= 1 / (q.optionsCount - 1)
    }
  }
  return g
}

/**
 * Records a finished attempt. The client sends raw answers; the server grades them.
 * Idempotent by `attemptId` (the offline outbox may resend). Subjects without a
 * server bank (custom uploads) are stored unranked and earn no points.
 */
export const recordAttempt = mutation({
  args: {
    secret: v.string(),
    deviceId: v.string(),
    attemptId: v.string(),
    slug: v.string(),
    subject: v.string(),
    mode: attemptMode,
    answers: v.array(v.union(v.number(), v.null())),
    questionIds: v.array(v.string()),
    timeTaken: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { secret, deviceId, attemptId, answers, questionIds } = args
    assertSecret(secret)
    assertDeviceId(deviceId)
    if (attemptId.length < 8 || attemptId.length > 64) throw new ConvexError('Invalid attempt id')
    if (args.slug.length === 0 || args.slug.length > 80) throw new ConvexError('Invalid slug')
    if (answers.length === 0 || answers.length > MAX_QUESTIONS_PER_ATTEMPT) {
      throw new ConvexError('Invalid number of answers')
    }
    if (questionIds.length !== answers.length) throw new ConvexError('answers and questionIds differ in length')
    if (!Number.isFinite(args.timeTaken) || args.timeTaken < 0) throw new ConvexError('Invalid timeTaken')
    if (!Number.isFinite(args.createdAt)) throw new ConvexError('Invalid createdAt')

    const duplicate = await ctx.db
      .query('attempts')
      .withIndex('by_attemptId', (q) => q.eq('attemptId', attemptId))
      .unique()
    if (duplicate) {
      return { attemptId, ranked: duplicate.ranked, points: duplicate.points, duplicate: true }
    }

    const player = await ensurePlayerRow(ctx, secret, deviceId)
    const bank = await ctx.db
      .query('questionBanks')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    const now = Date.now()
    const base = {
      playerId: player._id,
      deviceId,
      attemptId,
      slug: args.slug,
      subject: args.subject.slice(0, 200),
      mode: args.mode,
      answers,
      questionIds,
      timeTaken: Math.round(args.timeTaken),
      createdAt: args.createdAt,
      receivedAt: now,
    }

    if (!bank) {
      const answered = answers.filter((a) => a !== null).length
      await ctx.db.insert('attempts', { ...base, ranked: false, answered, correct: 0, wrong: 0, newlyMastered: 0, points: 0 })
      return { attemptId, ranked: false, points: 0, duplicate: false }
    }

    const g = await grade(ctx, player._id, bank, answers, questionIds)
    const points = round2(g.points)
    await ctx.db.insert('attempts', { ...base, ranked: true, bankVersion: bank.version, ...g, points })

    const stats = await getStats(ctx, player._id)
    if (stats) {
      await ctx.db.patch(stats._id, {
        answered: stats.answered + g.answered,
        correct: stats.correct + g.correct,
        wrong: stats.wrong + g.wrong,
        points: round2(stats.points + g.points),
        attempts: stats.attempts + 1,
        mastered: stats.mastered + g.newlyMastered,
        lastActiveAt: now,
      })
    } else {
      await ctx.db.insert('playerStats', {
        playerId: player._id,
        answered: g.answered,
        correct: g.correct,
        wrong: g.wrong,
        points,
        attempts: 1,
        mastered: g.newlyMastered,
        lastActiveAt: now,
      })
    }

    return { attemptId, ranked: true, points, duplicate: false }
  },
})
