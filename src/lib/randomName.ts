// Mirrors the name scheme in convex/players.ts (same word lists, FNV-1a + mulberry32)
// so the client preview matches the first candidate the server assigns.
// Keep in sync with convex/players.ts.

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

function hashString(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

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

/** Deterministic "Adjective Animal NN" for a device id (server may adjust NN on collision). */
export function previewRandomName(deviceId: string): string {
  const rand = mulberry32(hashString(deviceId))
  const adjective = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(rand() * ANIMALS.length)]
  const num = 10 + Math.floor(rand() * 90)
  return `${adjective} ${animal} ${num}`
}