import { ConvexError, v } from 'convex/values'
import { mutation, query, type QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import {
  deletePlayerData,
  getPlayerBySecret,
  getPlayerForDevice,
  hasProgress,
  mapDevice,
  MAX_DEVICES,
} from './lib/playerStore'
import { assertDeviceId, assertSecret, randomDigits, randomHex, safeEqual } from './lib/util'

/**
 * Device linking. The NEW device shows a 6-digit code; an EXISTING device
 * (which owns a player) approves it. A player has at most 2 devices, forever:
 * there is no unlink and points never transfer between players.
 */

const CODE_TTL_MS = 10 * 60 * 1000
const CODE_LIMIT = 5 // codes per device per 10 minutes
const APPROVE_FAILURE_LIMIT = 10 // wrong codes per player per 15 minutes
const APPROVE_WINDOW_MS = 15 * 60 * 1000
const CODE_PATTERN = /^\d{6}$/

async function findDeviceCode(ctx: QueryCtx, deviceId: string, code: string): Promise<Doc<'linkCodes'> | null> {
  if (!CODE_PATTERN.test(code)) return null
  const rows = await ctx.db
    .query('linkCodes')
    .withIndex('by_code', (q) => q.eq('code', code))
    .collect()
  return rows.filter((r) => r.newDeviceId === deviceId).sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
}

/**
 * New device: create a code. Refused when this device already shares a player
 * with another device, or (unless `replace`) when its own player has progress.
 * `replace: true` deletes this device's player, attempts, stats and mastery first.
 */
export const createCode = mutation({
  args: { deviceId: v.string(), replace: v.optional(v.boolean()) },
  handler: async (ctx, { deviceId, replace }) => {
    assertDeviceId(deviceId)
    const now = Date.now()

    const recent = await ctx.db
      .query('linkCodes')
      .withIndex('by_device', (q) => q.eq('newDeviceId', deviceId).gt('createdAt', now - CODE_TTL_MS))
      .collect()
    if (recent.length >= CODE_LIMIT) return { ok: false as const, reason: 'rate_limited' as const }

    const own = await getPlayerForDevice(ctx, deviceId)
    if (own) {
      if (own.deviceCount >= MAX_DEVICES) return { ok: false as const, reason: 'already_linked' as const }
      if (await hasProgress(ctx, own._id)) {
        if (!replace) return { ok: false as const, reason: 'has_progress' as const }
        await deletePlayerData(ctx, own._id)
      }
    }

    // One live code per device: retire older ones
    for (const r of recent) {
      if (r.consumedAt === undefined && r.expiresAt > now) await ctx.db.patch(r._id, { expiresAt: now })
    }

    let code = ''
    for (let i = 0; i < 20 && !code; i++) {
      const candidate = randomDigits(6)
      const clash = await ctx.db
        .query('linkCodes')
        .withIndex('by_code', (q) => q.eq('code', candidate))
        .filter((q) => q.and(q.eq(q.field('consumedAt'), undefined), q.gt(q.field('expiresAt'), now)))
        .first()
      if (!clash) code = candidate
    }
    if (!code) throw new ConvexError('Could not create a code, try again')

    const expiresAt = now + CODE_TTL_MS
    await ctx.db.insert('linkCodes', { code, newDeviceId: deviceId, createdAt: now, expiresAt })
    return { ok: true as const, code, expiresAt }
  },
})

/** Existing device: approve a code shown by the new device. Failures are returned (not thrown) so they're counted. */
export const approve = mutation({
  args: { secret: v.string(), code: v.string() },
  handler: async (ctx, { secret, code }) => {
    assertSecret(secret)
    const now = Date.now()
    const player = await getPlayerBySecret(ctx, secret)
    if (!player) return { ok: false as const, reason: 'no_player' as const }
    if (player.deviceCount >= MAX_DEVICES) return { ok: false as const, reason: 'full' as const }

    const failures = await ctx.db
      .query('linkAttempts')
      .withIndex('by_player_at', (q) => q.eq('playerId', player._id).gt('at', now - APPROVE_WINDOW_MS))
      .collect()
    if (failures.length >= APPROVE_FAILURE_LIMIT) return { ok: false as const, reason: 'rate_limited' as const }

    const rows = CODE_PATTERN.test(code)
      ? await ctx.db.query('linkCodes').withIndex('by_code', (q) => q.eq('code', code)).collect()
      : []
    const live = rows.find((r) => r.consumedAt === undefined && r.expiresAt > now)
    if (!live) {
      await ctx.db.insert('linkAttempts', { playerId: player._id, at: now })
      const expired = rows.some((r) => r.consumedAt === undefined)
      return { ok: false as const, reason: expired ? ('expired' as const) : ('invalid' as const) }
    }
    if (player.deviceIds.includes(live.newDeviceId)) return { ok: false as const, reason: 'self' as const }

    // The new device must be fresh. An empty player it created earlier is discarded.
    const previous = await getPlayerForDevice(ctx, live.newDeviceId)
    if (previous && previous._id !== player._id) {
      if (previous.deviceCount > 1 || (await hasProgress(ctx, previous._id))) {
        return { ok: false as const, reason: 'has_progress' as const }
      }
      await deletePlayerData(ctx, previous._id)
    }

    await ctx.db.patch(live._id, { consumedAt: now, playerId: player._id, handoff: randomHex(16) })
    const deviceIds = [...player.deviceIds, live.newDeviceId]
    await ctx.db.patch(player._id, { deviceIds, deviceCount: deviceIds.length })
    await mapDevice(ctx, live.newDeviceId, player._id)
    return { ok: true as const, deviceCount: deviceIds.length }
  },
})

/** New device: status of its code. Once approved, returns a one-time handoff token. */
export const poll = query({
  args: { deviceId: v.string(), code: v.string() },
  handler: async (ctx, { deviceId, code }) => {
    const row = await findDeviceCode(ctx, deviceId, code)
    if (!row) return { status: 'missing' as const }
    if (row.consumedAt !== undefined && row.handoff) return { status: 'linked' as const, handoff: row.handoff }
    if (row.expiresAt <= Date.now()) return { status: 'expired' as const }
    return { status: 'pending' as const, expiresAt: row.expiresAt }
  },
})

/** New device: exchange the handoff token for the player secret. The code is deleted. */
export const redeem = mutation({
  args: { deviceId: v.string(), code: v.string(), handoff: v.string() },
  handler: async (ctx, { deviceId, code, handoff }) => {
    assertDeviceId(deviceId)
    const row = await findDeviceCode(ctx, deviceId, code)
    if (!row || row.consumedAt === undefined || !row.handoff || !row.playerId || !safeEqual(handoff, row.handoff)) {
      throw new ConvexError('This link is not ready or has already been used')
    }
    const player = await ctx.db.get(row.playerId)
    await ctx.db.delete(row._id)
    if (!player?.secret) throw new ConvexError('The other device’s player no longer exists')
    return { secret: player.secret }
  },
})
