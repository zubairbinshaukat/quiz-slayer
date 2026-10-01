import { ConvexError } from 'convex/values'
import type { FunctionArgs } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { convexClient } from './convex'
import { addToOutbox, clearOutbox, deleteOutboxItem, getOutbox } from './db'
import { getDeviceId } from './deviceId'
import { ensurePlayer } from './identity'
import { isRecord, type HistoryEntry } from '../types'

/** Queued without the secret: it is attached at send time (a link may change it). */
export type RecordAttemptArgs = Omit<FunctionArgs<typeof api.attempts.recordAttempt>, 'secret'>

const MAX_ANSWERS = 500

function newAttemptId(): string {
  try {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch { /* fall through */ }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}`
}

/**
 * Maps a saved history entry to the backend's recordAttempt args: raw answers
 * plus question ids; the server grades them. Null for entries it would reject.
 */
export function buildAttemptArgs(entry: HistoryEntry, deviceId: string): RecordAttemptArgs | null {
  const { questionIds, answers } = entry
  if (!questionIds || questionIds.length !== answers.length) return null
  if (answers.length === 0 || answers.length > MAX_ANSWERS) return null
  return {
    deviceId,
    attemptId: newAttemptId(),
    slug: entry.slug,
    subject: entry.subject,
    mode: entry.mode ?? 'quiz',
    answers,
    questionIds,
    timeTaken: Math.max(0, Math.round(entry.timeTaken)),
    createdAt: Date.parse(entry.dateTaken) || Date.now(),
  }
}

/** Items queued by older versions (client-graded, no attemptId) can't be graded and are dropped. */
function isCurrentShape(args: unknown): args is RecordAttemptArgs {
  return isRecord(args) && typeof args.attemptId === 'string' && Array.isArray(args.questionIds)
}

let flushing: Promise<void> | null = null
let flushAgain = false

async function flushOnce(): Promise<void> {
  const client = convexClient
  if (!client || !navigator.onLine) return
  const items = await getOutbox<unknown>()
  if (items.length === 0) return

  // Creates (or claims) the player on the first finished quiz
  const secret = await ensurePlayer()
  if (!secret) return // offline or server error: keep everything queued

  for (const item of items) {
    if (!isCurrentShape(item.args)) {
      await deleteOutboxItem(item.id)
      continue
    }
    try {
      await client.mutation(api.attempts.recordAttempt, { ...item.args, secret })
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
 * Queues a finished attempt for the server and tries to send it. Custom subjects
 * are sent too (stored unranked). With Convex disabled nothing is queued.
 */
export async function recordAttempt(entry: HistoryEntry): Promise<void> {
  if (!convexClient) return
  const args = buildAttemptArgs(entry, getDeviceId())
  if (!args) return
  await addToOutbox(args)
  void flushOutbox()
}

/** Linking with "replace my progress": unsent attempts belong to the discarded progress. */
export function discardQueuedAttempts(): Promise<void> {
  return clearOutbox()
}

let started = false

/** Flush on app start and whenever the connection comes back. */
export function startOutboxSync(): void {
  if (started || !convexClient || typeof window === 'undefined') return
  started = true
  window.addEventListener('online', () => void flushOutbox())
  void flushOutbox()
}
