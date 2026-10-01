import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { ensurePlayerRow, getPlayerBySecret } from './lib/playerStore'
import { assertDeviceId, assertSecret } from './lib/util'

/** Public view of a player: never includes the secret or device ids. */
function publicPlayer(p: Doc<'players'>) {
  return {
    playerId: p._id,
    name: p.name,
    nameChosen: p.nameChosen,
    deviceCount: p.deviceCount,
  }
}

/**
 * Returns the player for this secret, creating it (or attaching the secret to
 * this device's pre-secret player) if needed. Called lazily: after the first
 * finished quiz or the first leaderboard visit.
 */
export const ensurePlayer = mutation({
  args: { secret: v.string(), deviceId: v.string() },
  handler: async (ctx, { secret, deviceId }) => {
    assertSecret(secret)
    assertDeviceId(deviceId)
    return publicPlayer(await ensurePlayerRow(ctx, secret, deviceId))
  },
})

/**
 * One-time migration from device-id identity: attaches a freshly generated
 * secret to the player row that already belongs to this device, or creates the
 * player if the device never reached the server. Idempotent.
 */
export const claimLegacy = mutation({
  args: { deviceId: v.string(), secret: v.string() },
  handler: async (ctx, { deviceId, secret }) => {
    assertSecret(secret)
    assertDeviceId(deviceId)
    return publicPlayer(await ensurePlayerRow(ctx, secret, deviceId))
  },
})

const NAME_PATTERN = /^[A-Za-z0-9 ]{2,20}$/

/** One-time name change. Names are unique case-insensitively. */
export const setName = mutation({
  args: { secret: v.string(), name: v.string() },
  handler: async (ctx, { secret, name }) => {
    assertSecret(secret)
    const trimmed = name.trim()
    if (!NAME_PATTERN.test(trimmed)) {
      throw new ConvexError('Name must be 2–20 characters: letters, digits and spaces only')
    }

    const player = await getPlayerBySecret(ctx, secret)
    if (!player) throw new ConvexError('Player not found')
    if (player.nameChosen) throw new ConvexError('Name has already been chosen')

    const nameLower = trimmed.toLowerCase()
    const holder = await ctx.db
      .query('players')
      .withIndex('by_name', (q) => q.eq('nameLower', nameLower))
      .first()
    if (holder && holder._id !== player._id) {
      throw new ConvexError('That name is already taken')
    }

    await ctx.db.patch(player._id, { name: trimmed, nameLower, nameChosen: true })
    return publicPlayer({ ...player, name: trimmed, nameLower, nameChosen: true })
  },
})

/** The caller's player (null until one has been created for this secret). */
export const me = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    const player = await getPlayerBySecret(ctx, secret)
    return player ? publicPlayer(player) : null
  },
})
