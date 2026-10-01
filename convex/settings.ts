import { query } from './_generated/server'

/**
 * Retired with the demo leaderboard. Kept because installed apps still running an older
 * cached build subscribe to it from the leaderboard; removing it would crash their board.
 */
export const get = query({
  args: {},
  handler: async () => ({ demoLeaderboard: false }),
})
