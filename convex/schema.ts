import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const attemptMode = v.union(v.literal('quiz'), v.literal('exam'), v.literal('retry'))

// Coarse device categories (shared by analytics counters and the owner's player view)
export const deviceType = v.union(v.literal('mobile'), v.literal('tablet'), v.literal('desktop'))
export const deviceOs = v.union(v.literal('ios'), v.literal('android'), v.literal('windows'), v.literal('mac'), v.literal('linux'), v.literal('otherOs'))
export const deviceBrowser = v.union(v.literal('chrome'), v.literal('safari'), v.literal('firefox'), v.literal('edge'), v.literal('otherBrowser'))

/** What a device reports about itself with each finished quiz (no user agent string). */
export const deviceInfo = v.object({
  deviceType,
  os: deviceOs,
  browser: deviceBrowser,
  installed: v.boolean(),
})

/** Answer key for one question. Question text never leaves the client bundle. */
export const bankQuestion = v.object({
  id: v.string(),
  correctIndex: v.number(),
  optionsCount: v.number(),
})

export default defineSchema({
  // ─── Players and devices ────────────────────────────────────────────────
  players: defineTable({
    /**
     * 32-hex player secret generated on the client. Identifies the player and is
     * never returned by queries. Absent only on rows created before secrets
     * existed, until `players.claimLegacy` attaches one.
     */
    secret: v.optional(v.string()),
    /** Devices sharing this player (max 2, never removed). */
    deviceIds: v.array(v.string()),
    deviceCount: v.number(),
    name: v.string(),
    /** Lower-cased name for case-insensitive uniqueness checks */
    nameLower: v.string(),
    /** True once the player has picked their own name (one-time change) */
    nameChosen: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_secret', ['secret'])
    .index('by_name', ['nameLower']),

  /** deviceId → player lookup (arrays can't be indexed). One row per device. */
  playerDevices: defineTable({
    deviceId: v.string(),
    playerId: v.id('players'),
    /** Latest self-report from this device (owner stats page only). */
    info: v.optional(deviceInfo),
    lastSeenAt: v.optional(v.number()),
  })
    .index('by_deviceId', ['deviceId'])
    .index('by_player', ['playerId']),

  // ─── Grading ────────────────────────────────────────────────────────────
  questionBanks: defineTable({
    slug: v.string(),
    subject: v.string(),
    version: v.number(),
    questions: v.array(bankQuestion),
  }).index('by_slug', ['slug']),

  attempts: defineTable({
    playerId: v.id('players'),
    deviceId: v.string(),
    /** Client-generated uuid: makes retries from the offline outbox idempotent. */
    attemptId: v.string(),
    slug: v.string(),
    subject: v.string(),
    mode: attemptMode,
    answers: v.array(v.union(v.number(), v.null())),
    questionIds: v.array(v.string()),
    /** False when no server bank exists for the slug (custom subjects): no points. */
    ranked: v.boolean(),
    bankVersion: v.optional(v.number()),
    answered: v.number(),
    correct: v.number(),
    wrong: v.number(),
    /** Correct answers that earned a point (first time this player got them right). */
    newlyMastered: v.number(),
    /** Points this attempt added (can be negative). */
    points: v.number(),
    timeTaken: v.number(),
    /** Client clock when the attempt finished. */
    createdAt: v.number(),
    receivedAt: v.number(),
  })
    .index('by_attemptId', ['attemptId'])
    .index('by_player', ['playerId']),

  playerStats: defineTable({
    playerId: v.id('players'),
    answered: v.number(),
    correct: v.number(),
    wrong: v.number(),
    /** 2 dp */
    points: v.number(),
    attempts: v.number(),
    /** Distinct questions answered correctly at least once. */
    mastered: v.number(),
    lastActiveAt: v.number(),
  })
    .index('by_player', ['playerId'])
    .index('by_points', ['points']),

  /** One row per (player, `${slug}:${questionId}`) answered correctly at least once. */
  playerMastery: defineTable({
    playerId: v.id('players'),
    questionKey: v.string(),
  }).index('by_player_question', ['playerId', 'questionKey']),

  // ─── Device linking ─────────────────────────────────────────────────────
  linkCodes: defineTable({
    /** 6 digits */
    code: v.string(),
    newDeviceId: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
    playerId: v.optional(v.id('players')),
    /** One-time token handed to the new device once approved; exchanged for the secret. */
    handoff: v.optional(v.string()),
  })
    .index('by_code', ['code'])
    .index('by_device', ['newDeviceId', 'createdAt'])
    .index('by_expiresAt', ['expiresAt']),

  /** Failed link approvals, for rate limiting code guessing. */
  linkAttempts: defineTable({
    playerId: v.id('players'),
    at: v.number(),
  }).index('by_player_at', ['playerId', 'at']),

  /**
   * The reverse direction: the EXISTING device shows a 6-digit invite (e.g. on a
   * laptop screen) and the NEW device scans or types it to join that player.
   */
  linkInvites: defineTable({
    /** 6 digits */
    code: v.string(),
    playerId: v.id('players'),
    createdAt: v.number(),
    expiresAt: v.number(),
    claimedAt: v.optional(v.number()),
  })
    .index('by_code', ['code'])
    .index('by_player', ['playerId', 'createdAt'])
    .index('by_expiresAt', ['expiresAt']),

  /** Failed invite claims (wrong codes), per device and app-wide, for rate limiting guessing. */
  inviteFailures: defineTable({
    deviceId: v.string(),
    at: v.number(),
  })
    .index('by_device_at', ['deviceId', 'at'])
    .index('by_at', ['at']),

  // ─── Anonymous analytics (never shown in the app) ───────────────────────
  dailyStats: defineTable({
    /** UTC 'YYYY-MM-DD' */
    day: v.string(),
    visits: v.number(),
    uniques: v.number(),
    newDevices: v.number(),
    mobile: v.number(),
    tablet: v.number(),
    desktop: v.number(),
    ios: v.number(),
    android: v.number(),
    windows: v.number(),
    mac: v.number(),
    linux: v.number(),
    otherOs: v.number(),
    chrome: v.number(),
    safari: v.number(),
    firefox: v.number(),
    edge: v.number(),
    otherBrowser: v.number(),
    installedSessions: v.number(),
    installs_ios: v.number(),
    installs_android: v.number(),
    installs_desktop: v.number(),
  }).index('by_day', ['day']),

  /** Which hashed devices were seen on a day (for uniques). Pruned after 30 days. */
  dailyVisitors: defineTable({
    day: v.string(),
    /** SHA-256(deviceId), first 16 hex chars */
    deviceHash: v.string(),
  }).index('by_day_hash', ['day', 'deviceHash']),

  // ─── Owner stats access ─────────────────────────────────────────────────
  adminAttempts: defineTable({
    deviceId: v.string(),
    at: v.number(),
  })
    .index('by_device_at', ['deviceId', 'at'])
    .index('by_at', ['at']),

  adminSessions: defineTable({
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_expiresAt', ['expiresAt']),

  // ─── Retired: held the demo-leaderboard switch. Nothing reads or writes it; kept so
  // deployments that still have a row keep validating. ──
  appSettings: defineTable({
    key: v.literal('demoLeaderboard'),
    on: v.boolean(),
  }).index('by_key', ['key']),
})
