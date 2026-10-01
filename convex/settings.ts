import { query } from './_generated/server'

/**
 * Public app-wide switches (no secrets). `demoLeaderboard` is undefined until the owner sets it,
 * so the client can fall back to its own default (on in dev builds, off in production).
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const demo = await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', 'demoLeaderboard'))
      .unique()
    return { demoLeaderboard: demo?.on }
  },
})
