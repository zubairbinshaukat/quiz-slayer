import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { generateUniqueName } from './names'

/** A player can be shared by at most this many devices, forever. */
export const MAX_DEVICES = 2

export async function getPlayerBySecret(ctx: QueryCtx, secret: string): Promise<Doc<'players'> | null> {
  return await ctx.db
    .query('players')
    .withIndex('by_secret', (q) => q.eq('secret', secret))
    .unique()
}

export async function getDeviceRow(ctx: QueryCtx, deviceId: string): Promise<Doc<'playerDevices'> | null> {
  return await ctx.db
    .query('playerDevices')
    .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
    .unique()
}

/** The player this device currently belongs to, if any. */
export async function getPlayerForDevice(ctx: QueryCtx, deviceId: string): Promise<Doc<'players'> | null> {
  const row = await getDeviceRow(ctx, deviceId)
  return row ? await ctx.db.get(row.playerId) : null
}

export async function getStats(ctx: QueryCtx, playerId: Id<'players'>): Promise<Doc<'playerStats'> | null> {
  return await ctx.db
    .query('playerStats')
    .withIndex('by_player', (q) => q.eq('playerId', playerId))
    .unique()
}

/** True when the player has any server progress (ranked stats or any stored attempt). */
export async function hasProgress(ctx: QueryCtx, playerId: Id<'players'>): Promise<boolean> {
  const stats = await getStats(ctx, playerId)
  if (stats && stats.attempts > 0) return true
  const attempt = await ctx.db
    .query('attempts')
    .withIndex('by_player', (q) => q.eq('playerId', playerId))
    .first()
  return attempt !== null
}

/** Points this device at `playerId` (one row per device). */
export async function mapDevice(ctx: MutationCtx, deviceId: string, playerId: Id<'players'>): Promise<void> {
  const row = await getDeviceRow(ctx, deviceId)
  if (!row) await ctx.db.insert('playerDevices', { deviceId, playerId })
  else if (row.playerId !== playerId) await ctx.db.patch(row._id, { playerId })
}

/**
 * Finds the player for `secret`, or:
 *  - attaches the secret to this device's pre-secret (legacy) player, or
 *  - creates a new player for this device.
 */
export async function ensurePlayerRow(ctx: MutationCtx, secret: string, deviceId: string): Promise<Doc<'players'>> {
  const existing = await getPlayerBySecret(ctx, secret)
  if (existing) return existing

  const devicePlayer = await getPlayerForDevice(ctx, deviceId)
  if (devicePlayer && devicePlayer.secret === undefined) {
    await ctx.db.patch(devicePlayer._id, { secret })
    return { ...devicePlayer, secret }
  }

  const name = await generateUniqueName(ctx, deviceId)
  const id = await ctx.db.insert('players', {
    secret,
    deviceIds: [deviceId],
    deviceCount: 1,
    name,
    nameLower: name.toLowerCase(),
    nameChosen: false,
    createdAt: Date.now(),
  })
  await mapDevice(ctx, deviceId, id)
  const created = await ctx.db.get(id)
  if (!created) throw new Error('Failed to create player')
  return created
}

/** Deletes a player with all of its attempts, stats, mastery, device rows and link failures. */
export async function deletePlayerData(ctx: MutationCtx, playerId: Id<'players'>): Promise<void> {
  const tables = [
    ctx.db.query('attempts').withIndex('by_player', (q) => q.eq('playerId', playerId)).collect(),
    ctx.db.query('playerStats').withIndex('by_player', (q) => q.eq('playerId', playerId)).collect(),
    ctx.db.query('playerMastery').withIndex('by_player_question', (q) => q.eq('playerId', playerId)).collect(),
    ctx.db.query('playerDevices').withIndex('by_player', (q) => q.eq('playerId', playerId)).collect(),
    ctx.db.query('linkAttempts').withIndex('by_player_at', (q) => q.eq('playerId', playerId)).collect(),
  ]
  for (const rows of await Promise.all(tables)) {
    for (const row of rows) await ctx.db.delete(row._id)
  }
  await ctx.db.delete(playerId)
}
