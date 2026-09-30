import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const attemptMode = v.union(v.literal('quiz'), v.literal('exam'), v.literal('retry'))

export default defineSchema({
  players: defineTable({
    deviceId: v.string(),
    name: v.string(),
    /** Lower-cased name for case-insensitive uniqueness checks */
    nameLower: v.string(),
    /** True once the player has picked their own name (one-time change) */
    nameChosen: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_deviceId', ['deviceId'])
    .index('by_name', ['nameLower']),

  attempts: defineTable({
    deviceId: v.string(),
    slug: v.string(),
    subject: v.string(),
    mode: attemptMode,
    answers: v.array(v.union(v.number(), v.null())),
    correctIds: v.array(v.string()),
    wrongIds: v.array(v.string()),
    answered: v.number(),
    correct: v.number(),
    wrong: v.number(),
    optionsCount: v.number(),
    timeTaken: v.number(),
    createdAt: v.number(),
  })
    .index('by_deviceId', ['deviceId'])
    .index('by_createdAt', ['createdAt']),

  playerStats: defineTable({
    deviceId: v.string(),
    answered: v.number(),
    correct: v.number(),
    wrong: v.number(),
    points: v.number(),
    attempts: v.number(),
    lastActiveAt: v.number(),
  })
    .index('by_deviceId', ['deviceId'])
    .index('by_points', ['points']),
})
