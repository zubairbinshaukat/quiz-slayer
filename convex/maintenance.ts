import { internalMutation } from './_generated/server'

const HOUR = 60 * 60 * 1000
const BATCH = 500

/** Cron: drop expired link codes, admin sessions and old rate-limit rows. */
export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const codes = await ctx.db
      .query('linkCodes')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now - HOUR))
      .take(BATCH)
    const invites = await ctx.db
      .query('linkInvites')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now - HOUR))
      .take(BATCH)
    const inviteFailures = await ctx.db
      .query('inviteFailures')
      .withIndex('by_at', (q) => q.lt('at', now - 24 * HOUR))
      .take(BATCH)
    const sessions = await ctx.db
      .query('adminSessions')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now))
      .take(BATCH)
    const adminFailures = await ctx.db
      .query('adminAttempts')
      .withIndex('by_at', (q) => q.lt('at', now - 24 * HOUR))
      .take(BATCH)
    // linkAttempts has no time-only index; rows are tiny and only written on wrong codes
    const linkFailures = (await ctx.db.query('linkAttempts').take(BATCH)).filter((r) => r.at < now - 24 * HOUR)

    for (const rows of [codes, invites, inviteFailures, sessions, adminFailures, linkFailures]) {
      for (const row of rows) await ctx.db.delete(row._id)
    }
    return null
  },
})
