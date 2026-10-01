import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, type MutationCtx } from './_generated/server'
import { bankQuestion } from './schema'
import { readEnv, safeEqual } from './lib/util'

const MAX_QUESTIONS = 5000
const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/

const bankArgs = {
  slug: v.string(),
  subject: v.string(),
  questions: v.array(bankQuestion),
}

interface BankInput {
  slug: string
  subject: string
  questions: { id: string; correctIndex: number; optionsCount: number }[]
}

function validate({ slug, subject, questions }: BankInput): void {
  if (!SLUG_PATTERN.test(slug)) throw new ConvexError(`Invalid slug: ${slug}`)
  if (subject.length === 0 || subject.length > 200) throw new ConvexError('Invalid subject name')
  if (questions.length === 0 || questions.length > MAX_QUESTIONS) throw new ConvexError('Invalid question count')
  const seen = new Set<string>()
  for (const q of questions) {
    if (q.id.length === 0 || q.id.length > 64) throw new ConvexError('Invalid question id')
    if (seen.has(q.id)) throw new ConvexError(`Duplicate question id ${q.id}`)
    seen.add(q.id)
    if (!Number.isInteger(q.optionsCount) || q.optionsCount < 2 || q.optionsCount > 10) {
      throw new ConvexError(`Question ${q.id}: optionsCount must be 2–10`)
    }
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.optionsCount) {
      throw new ConvexError(`Question ${q.id}: correctIndex out of range`)
    }
  }
}

function sameQuestions(a: BankInput['questions'], b: BankInput['questions']): boolean {
  if (a.length !== b.length) return false
  return a.every((q, i) => q.id === b[i].id && q.correctIndex === b[i].correctIndex && q.optionsCount === b[i].optionsCount)
}

/** Inserts or replaces a bank; bumps `version` only when the answer key changed. */
async function upsertBank(ctx: MutationCtx, input: BankInput) {
  validate(input)
  const existing = await ctx.db
    .query('questionBanks')
    .withIndex('by_slug', (q) => q.eq('slug', input.slug))
    .unique()
  if (!existing) {
    await ctx.db.insert('questionBanks', { ...input, version: 1 })
    return { slug: input.slug, version: 1, status: 'created' as const }
  }
  if (existing.subject === input.subject && sameQuestions(existing.questions, input.questions)) {
    return { slug: input.slug, version: existing.version, status: 'unchanged' as const }
  }
  const version = existing.version + 1
  await ctx.db.patch(existing._id, { subject: input.subject, questions: input.questions, version })
  return { slug: input.slug, version, status: 'updated' as const }
}

/** Dashboard / `npx convex run banks:upsert` entry point (admin only). */
export const upsert = internalMutation({
  args: bankArgs,
  handler: async (ctx, args) => await upsertBank(ctx, args),
})

/**
 * Same as `upsert`, callable over HTTP by `npm run banks:push`. Guarded by the
 * BANKS_ADMIN_KEY deployment env var; always refuses when it is unset.
 */
export const push = mutation({
  args: { adminKey: v.string(), ...bankArgs },
  handler: async (ctx, { adminKey, ...bank }) => {
    const expected = readEnv('BANKS_ADMIN_KEY')
    if (!expected || !safeEqual(adminKey, expected)) throw new ConvexError('Not authorised')
    return await upsertBank(ctx, bank)
  },
})
