import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.daily('prune daily visitors', { hourUTC: 3, minuteUTC: 15 }, internal.analytics.pruneVisitors, {})
crons.daily('cleanup expired rows', { hourUTC: 3, minuteUTC: 30 }, internal.maintenance.cleanup, {})

export default crons
