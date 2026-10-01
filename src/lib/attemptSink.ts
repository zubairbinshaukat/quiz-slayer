import { ConvexError } from 'convex/values'
import type { FunctionArgs } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { convexClient } from './convex'
import { addToOutbox, deleteOutboxItem, getOutbox } from './db'
import { getDeviceId } from './deviceId'
import type { HistoryEntry } from '../types'

export type AttemptRecord = HistoryEntry & { deviceId: string }
export type RecordAttemptArgs = FunctionArgs<typeof api.attempts.recordAttempt>

const MAX_ANSWERS = 500

/**
 * Maps a saved history entry to the backend's recordAttempt args. Only answered
 * questions are graded (skips carry no penalty), matching the local leaderboard.
 * Returns null for entries the server would reject.
 */
export function buildAttemptArgs(entry: AttemptRecord): RecordAttemptArgs | null {
  const { questionIds, answers } = entry
  const optionsCount = entry.optionsCount ?? 4
  if (!questionIds || questionIds.length !== answers.length) return null
  if (answers.length === 0 || answers.length > MAX_ANSWERS) return null
  if (!Number.isInteger(optionsCount) || optionsCount < 2 || optionsCount > 10) return null

  const wrongSet = new Set(entry.wrongIds ?? [])
  const correctIds: string[] = []
  const wrongIds: string[] = []
  questionIds.forEach((id, i) => {
    if (answers[i] === null) return
    if (wrongSet.has(id)) wrongIds.push(id)
    else correctIds.push(id)
  })

  return {
    deviceId: entry.deviceId,
    slug: entry.slug,
    subject: entry.subject,
    mode: entry.mode ?? 'quiz',
    answers,
    correctIds,
    wrongIds,
    optionsCount,
    timeTaken: Math.max(0, Math.round(entry.timeTaken)),
  }
}

let flushing: Promise<void> | null = null
let flushAgain = false
let playerEnsured = false

async function flushOnce(): Promise<void> {
  const client = convexClient
  if (!client || !navigator.onLine) return
  const items = await getOutbox<RecordAttemptArgs>()
  if (items.length === 0) return

  // The player row must exist before stats are attached to the device (idempotent).
  if (!playerEnsured) {
    try {
      await client.mutation(api.players.ensurePlayer, { deviceId: getDeviceId() })
      playerEnsured = true
    } catch {
      return // offline or server error: keep everything queued
    }
  }

  for (const item of items) {
    try {
      await client.mutation(api.attempts.recordAttempt, item.args)
      await deleteOutboxItem(item.id)
    } catch (err) {
      // The server rejected this attempt as invalid: retrying can never succeed.
      if (err instanceof ConvexError) {
        console.warn('Leaderboard rejected an attempt; dropping it', err.data)
        await deleteOutboxItem(item.id)
        continue
      }
      return // network / transient failure: keep this and the rest for the next flush
    }
  }
}

/**
 * Sends queued attempts oldest first; deletes each on success, keeps it on failure.
 * Concurrent calls share one run; a call made mid-run schedules one more pass.
 */
export function flushOutbox(): Promise<void> {
  if (!convexClient) return Promise.resolve()
  if (flushing) {
    flushAgain = true
    return flushing
  }
  flushing = (async () => {
    try {
      do {
        flushAgain = false
        await flushOnce()
      } while (flushAgain && navigator.onLine)
    } finally {
      flushing = null
    }
  })()
  return flushing
}

/**
 * Queues a finished attempt for the global leaderboard and tries to send it.
 * With Convex disabled attempts stay local only (nothing is queued).
 */
export async function recordAttempt(entry: AttemptRecord): Promise<void> {
  if (!convexClient) return
  const args = buildAttemptArgs(entry)
  if (!args) return
  await addToOutbox(args)
  void flushOutbox()
}

let started = false

/** Flush on app start and whenever the connection comes back. */
export function startOutboxSync(): void {
  if (started || !convexClient || typeof window === 'undefined') return
  started = true
  window.addEventListener('online', () => void flushOutbox())
  void flushOutbox()
}
