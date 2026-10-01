import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation, mutation, type MutationCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { deviceBrowser as browser, deviceOs as os, deviceType } from './schema'

/**
 * Anonymous, aggregate-only usage counters. No IP, location, user agent string
 * or identifier is stored: only per-day counts and, for 30 days, a truncated
 * SHA-256 of the device id to count unique visitors.
 */

type Counters = Omit<Doc<'dailyStats'>, '_id' | '_creationTime' | 'day'>
type CounterKey = keyof Counters

const EMPTY: Counters = {
  visits: 0, uniques: 0, newDevices: 0,
  mobile: 0, tablet: 0, desktop: 0,
  ios: 0, android: 0, windows: 0, mac: 0, linux: 0, otherOs: 0,
  chrome: 0, safari: 0, firefox: 0, edge: 0, otherBrowser: 0,
  installedSessions: 0, installs_ios: 0, installs_android: 0, installs_desktop: 0,
}

const platform = v.union(v.literal('ios'), v.literal('android'), v.literal('desktop'))

const HASH_PATTERN = /^[0-9a-f]{16}$/
const VISITOR_RETENTION_DAYS = 30
const PRUNE_BATCH = 1000

/** UTC 'YYYY-MM-DD'. */
export function dayOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

async function bump(ctx: MutationCtx, day: string, keys: CounterKey[]): Promise<void> {
  const row = await ctx.db
    .query('dailyStats')
    .withIndex('by_day', (q) => q.eq('day', day))
    .unique()
  const next: Counters = row ? { ...EMPTY, ...stripMeta(row) } : { ...EMPTY }
  for (const k of keys) next[k] += 1
  if (row) await ctx.db.patch(row._id, next)
  else await ctx.db.insert('dailyStats', { day, ...next })
}

function stripMeta(row: Doc<'dailyStats'>): Counters {
  const { _id: _i, _creationTime: _c, day: _d, ...counters } = row
  return counters
}

/** Once per browser session. Device/OS/browser splits count unique devices per day. */
export const trackVisit = mutation({
  args: {
    deviceHash: v.string(),
    deviceType,
    os,
    browser,
    installed: v.boolean(),
    /** The device id was created during this page load. */
    firstVisit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!HASH_PATTERN.test(args.deviceHash)) return null
    const day = dayOf(Date.now())
    const keys: CounterKey[] = ['visits']
    if (args.installed) keys.push('installedSessions')
    if (args.firstVisit) keys.push('newDevices')

    const seen = await ctx.db
      .query('dailyVisitors')
      .withIndex('by_day_hash', (q) => q.eq('day', day).eq('deviceHash', args.deviceHash))
      .unique()
    if (!seen) {
      await ctx.db.insert('dailyVisitors', { day, deviceHash: args.deviceHash })
      keys.push('uniques', args.deviceType, args.os, args.browser)
    }
    await bump(ctx, day, keys)
    return null
  },
})

/** Counted on `appinstalled` (Android / desktop) or the first standalone launch on iOS. */
export const trackInstall = mutation({
  args: { platform },
  handler: async (ctx, { platform: p }) => {
    await bump(ctx, dayOf(Date.now()), [`installs_${p}`])
    return null
  },
})

/** Cron: forget which hashed devices visited more than 30 days ago. Reschedules itself while rows remain. */
export const pruneVisitors = internalMutation({
  args: {},
  handler: async (ctx): Promise<number> => {
    const cutoff = dayOf(Date.now() - VISITOR_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    const old = await ctx.db
      .query('dailyVisitors')
      .withIndex('by_day_hash', (q) => q.lt('day', cutoff))
      .take(PRUNE_BATCH)
    for (const row of old) await ctx.db.delete(row._id)
    if (old.length === PRUNE_BATCH) await ctx.scheduler.runAfter(0, internal.analytics.pruneVisitors, {})
    return old.length
  },
})
