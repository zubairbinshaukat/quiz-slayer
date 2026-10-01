import { ConvexError } from 'convex/values'
import type { MutationCtx, QueryCtx } from '../_generated/server'

// Words are ≤ 8 chars so "Adjective Animal NN" always fits the 20-char name limit.
// Keep in sync with src/lib/randomName.ts (the client preview).

const ADJECTIVES = [
  'Brave', 'Swift', 'Clever', 'Mighty', 'Silent', 'Lucky', 'Bold', 'Calm',
  'Cosmic', 'Crimson', 'Daring', 'Eager', 'Fierce', 'Gentle', 'Golden', 'Happy',
  'Hidden', 'Jolly', 'Keen', 'Lively', 'Loyal', 'Lunar', 'Merry', 'Misty',
  'Noble', 'Nimble', 'Plucky', 'Proud', 'Quick', 'Quiet', 'Rapid', 'Rogue',
  'Royal', 'Rusty', 'Shiny', 'Sly', 'Snowy', 'Solar', 'Sonic', 'Spicy',
  'Stormy', 'Sunny', 'Tiny', 'Turbo', 'Vivid', 'Wild', 'Wise', 'Witty',
  'Zesty', 'Frosty', 'Blazing', 'Electric', 'Epic', 'Fuzzy', 'Grumpy', 'Humble',
  'Icy', 'Mystic', 'Neon', 'Pixel',
] as const

const ANIMALS = [
  'Otter', 'Falcon', 'Tiger', 'Panda', 'Koala', 'Fox', 'Wolf', 'Eagle',
  'Hawk', 'Owl', 'Lynx', 'Badger', 'Beaver', 'Bison', 'Camel', 'Cobra',
  'Coyote', 'Crane', 'Dingo', 'Dolphin', 'Donkey', 'Ferret', 'Gecko', 'Gibbon',
  'Gopher', 'Heron', 'Hippo', 'Hyena', 'Ibis', 'Iguana', 'Jackal', 'Jaguar',
  'Kiwi', 'Lemur', 'Llama', 'Lobster', 'Magpie', 'Marmot', 'Moose', 'Narwhal',
  'Ocelot', 'Orca', 'Osprey', 'Panther', 'Parrot', 'Pelican', 'Penguin', 'Puffin',
  'Python', 'Quokka', 'Rabbit', 'Raven', 'Salmon', 'Shark', 'Sloth', 'Walrus',
  'Weasel', 'Wombat', 'Yak', 'Zebra',
] as const

const MAX_NAME_ATTEMPTS = 90

/** FNV-1a 32-bit hash — stable seed derived from the device id. */
function hashString(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 — tiny deterministic PRNG returning floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export async function isNameTaken(ctx: QueryCtx, nameLower: string): Promise<boolean> {
  const existing = await ctx.db
    .query('players')
    .withIndex('by_name', (q) => q.eq('nameLower', nameLower))
    .first()
  return existing !== null
}

/** Picks "Adjective Animal NN" seeded by the device id; retries the number on collision. */
export async function generateUniqueName(ctx: MutationCtx, seed: string): Promise<string> {
  const rand = mulberry32(hashString(seed))
  const adjective = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(rand() * ANIMALS.length)]

  for (let attempt = 0; attempt < MAX_NAME_ATTEMPTS; attempt++) {
    const num = 10 + Math.floor(rand() * 90) // two digits: 10–99
    const name = `${adjective} ${animal} ${num}`
    if (!(await isNameTaken(ctx, name.toLowerCase()))) return name
  }

  // Extremely unlikely: every number for this word pair is taken. Re-roll the words too.
  for (let attempt = 0; attempt < MAX_NAME_ATTEMPTS; attempt++) {
    const name = `${ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]} ${
      ANIMALS[Math.floor(rand() * ANIMALS.length)]
    } ${10 + Math.floor(rand() * 90)}`
    if (!(await isNameTaken(ctx, name.toLowerCase()))) return name
  }
  throw new ConvexError('Could not generate a unique player name')
}
