import { v } from 'convex/values'
import { mutation, query, type QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { MIN_ANSWERED } from './leaderboard'
import { deletePlayerData } from './lib/playerStore'
import { assertDeviceId, randomHex, readEnv, safeEqual } from './lib/util'

/**
 * Owner-only stats access. The PIN lives in the ADMIN_PIN deployment env var
 * (Convex dashboard → Settings → Environment Variables); unset = login always fails.
 */

const WINDOW_MS = 15 * 60 * 1000
const DEVICE_FAILURE_LIMIT = 5
/** Caps guessing spread over many device ids. */
const GLOBAL_FAILURE_LIMIT = 30
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

async function validSession(ctx: QueryCtx, token: string): Promise<Doc<'adminSessions'> | null> {
  if (!/^[0-9a-f]{64}$/.test(token)) return null
  const session = await ctx.db
    .query('adminSessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .unique()
  return session && session.expiresAt > Date.now() ? session : null
}

/** Failures are returned rather than thrown so the failed-attempt row is kept. */
export const login = mutation({
  args: { deviceId: v.string(), pin: v.string() },
  handler: async (ctx, { deviceId, pin }) => {
    assertDeviceId(deviceId)
    const now = Date.now()
    const since = now - WINDOW_MS

    const deviceFailures = await ctx.db
      .query('adminAttempts')
      .withIndex('by_device_at', (q) => q.eq('deviceId', deviceId).gt('at', since))
      .collect()
    const globalFailures = await ctx.db
      .query('adminAttempts')
      .withIndex('by_at', (q) => q.gt('at', since))
      .take(GLOBAL_FAILURE_LIMIT)
    if (deviceFailures.length >= DEVICE_FAILURE_LIMIT || globalFailures.length >= GLOBAL_FAILURE_LIMIT) {
      return { ok: false as const, reason: 'locked' as const }
    }

    const expected = readEnv('ADMIN_PIN')
    if (!expected || !/^\d{6}$/.test(pin) || !safeEqual(pin, expected)) {
      await ctx.db.insert('adminAttempts', { deviceId, at: now })
      const left = DEVICE_FAILURE_LIMIT - deviceFailures.length - 1
      return { ok: false as const, reason: left > 0 ? ('wrong' as const) : ('locked' as const) }
    }

    for (const f of deviceFailures) await ctx.db.delete(f._id)
    const token = randomHex(32)
    const expiresAt = now + SESSION_TTL_MS
    await ctx.db.insert('adminSessions', { token, createdAt: now, expiresAt })
    return { ok: true as const, token, expiresAt }
  },
})

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await validSession(ctx, token)
    if (session) await ctx.db.delete(session._id)
    return null
  },
})

function accuracyOf(answered: number, correct: number): number {
  return answered > 0 ? Math.round((correct / answered) * 1000) / 10 : 0
}

function deviceView(d: Doc<'playerDevices'>) {
  return { info: d.info ?? null, lastSeenAt: d.lastSeenAt ?? null }
}

/**
 * Every player with their server-side totals (what the leaderboard uses; clearing history
 * on a device never touches these). Rank follows leaderboard.top's ordering; null = unranked.
 */
export const players = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await validSession(ctx, token))) return null

    const [players, stats, devices] = await Promise.all([
      ctx.db.query('players').collect(),
      ctx.db.query('playerStats').collect(),
      ctx.db.query('playerDevices').collect(),
    ])
    const statsBy = new Map(stats.map((s) => [s.playerId, s]))
    const devicesBy = new Map<Id<'players'>, Doc<'playerDevices'>[]>()
    for (const d of devices) devicesBy.set(d.playerId, [...(devicesBy.get(d.playerId) ?? []), d])

    const rows = players.map((p) => {
      const s = statsBy.get(p._id)
      const devs = devicesBy.get(p._id) ?? []
      const seen = Math.max(s?.lastActiveAt ?? 0, ...devs.map((d) => d.lastSeenAt ?? 0))
      const answered = s?.answered ?? 0
      return {
        id: p._id as string,
        name: p.name,
        nameChosen: p.nameChosen,
        createdAt: p.createdAt,
        lastActiveAt: seen > 0 ? seen : null,
        deviceCount: p.deviceCount,
        devices: devs.map(deviceView),
        points: s?.points ?? 0,
        answered,
        correct: s?.correct ?? 0,
        wrong: s?.wrong ?? 0,
        attempts: s?.attempts ?? 0,
        mastered: s?.mastered ?? 0,
        accuracy: accuracyOf(answered, s?.correct ?? 0),
        rank: null as number | null,
      }
    })

    const ranked = rows
      .filter((r) => r.answered >= MIN_ANSWERED)
      .sort((a, b) => b.points - a.points || b.accuracy - a.accuracy || a.attempts - b.attempts)
    ranked.forEach((r, i) => (r.rank = i + 1))
    return rows
  },
})

/** Owner removes a player (test accounts, spam names) with all of their server data. */
export const removePlayer = mutation({
  args: { token: v.string(), playerId: v.string() },
  handler: async (ctx, { token, playerId }) => {
    if (!(await validSession(ctx, token))) return { ok: false as const }
    const id = ctx.db.normalizeId('players', playerId)
    if (id && (await ctx.db.get(id))) await deletePlayerData(ctx, id)
    return { ok: true as const }
  },
})

const PLAYER_ATTEMPTS = 200

/** One player's devices, per-subject totals and most recent attempts (ranked and practice-only). */
export const player = query({
  args: { token: v.string(), playerId: v.string() },
  handler: async (ctx, { token, playerId }) => {
    if (!(await validSession(ctx, token))) return null
    const id = ctx.db.normalizeId('players', playerId)
    const p = id ? await ctx.db.get(id) : null
    if (!id || !p) return null

    const [attempts, devices] = await Promise.all([
      ctx.db.query('attempts').withIndex('by_player', (q) => q.eq('playerId', id)).order('desc').take(PLAYER_ATTEMPTS),
      ctx.db.query('playerDevices').withIndex('by_player', (q) => q.eq('playerId', id)).collect(),
    ])
    // Device ids stay server-side: attempts point at a device by its position in `devices`
    const deviceIndex = new Map(devices.map((d, i) => [d.deviceId, i]))

    const subjects = new Map<string, { slug: string; subject: string; attempts: number; answered: number; correct: number; wrong: number; points: number; ranked: boolean; lastAt: number }>()
    for (const a of attempts) {
      const s = subjects.get(a.slug) ?? { slug: a.slug, subject: a.subject, attempts: 0, answered: 0, correct: 0, wrong: 0, points: 0, ranked: a.ranked, lastAt: 0 }
      s.attempts++
      s.answered += a.answered
      s.correct += a.correct
      s.wrong += a.wrong
      s.points = Math.round((s.points + a.points) * 100) / 100
      s.lastAt = Math.max(s.lastAt, a.createdAt)
      subjects.set(a.slug, s)
    }

    return {
      id: p._id as string,
      name: p.name,
      devices: devices.map(deviceView),
      subjects: [...subjects.values()].sort((a, b) => b.lastAt - a.lastAt),
      attemptsShown: attempts.length,
      attemptsLimit: PLAYER_ATTEMPTS,
      attempts: attempts.map((a) => ({
        id: a._id as string,
        slug: a.slug,
        subject: a.subject,
        mode: a.mode,
        ranked: a.ranked,
        total: a.questionIds.length,
        answered: a.answered,
        correct: a.correct,
        wrong: a.wrong,
        points: a.points,
        newlyMastered: a.newlyMastered,
        timeTaken: a.timeTaken,
        createdAt: a.createdAt,
        device: deviceIndex.get(a.deviceId) ?? null,
      })),
    }
  },
})

type DayRow = Omit<Doc<'dailyStats'>, '_id' | '_creationTime'>

/** Last 60 days (oldest first) plus all-time totals; null for a missing or expired token. */
export const stats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await validSession(ctx, token))) return null

    const all = await ctx.db.query('dailyStats').withIndex('by_day').order('desc').collect()
    const strip = ({ _id: _i, _creationTime: _c, ...row }: Doc<'dailyStats'>): DayRow => row
    const days = all.slice(0, 60).map(strip).reverse()

    const totals: Record<string, number> = {}
    for (const row of all) {
      for (const [k, val] of Object.entries(strip(row))) {
        if (typeof val === 'number') totals[k] = (totals[k] ?? 0) + val
      }
    }
    return { days, totals: totals as Omit<DayRow, 'day'>, dayCount: all.length }
  },
})
