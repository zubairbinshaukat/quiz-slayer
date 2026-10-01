import { v } from 'convex/values'
import { mutation, query, type QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
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

/** Shows or hides the fake demo leaderboard for everyone (read by settings.get). */
export const setDemoLeaderboard = mutation({
  args: { token: v.string(), on: v.boolean() },
  handler: async (ctx, { token, on }) => {
    if (!(await validSession(ctx, token))) return { ok: false as const }
    const row = await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', 'demoLeaderboard'))
      .unique()
    if (row) await ctx.db.patch(row._id, { on })
    else await ctx.db.insert('appSettings', { key: 'demoLeaderboard', on })
    return { ok: true as const }
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
