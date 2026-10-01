/**
 * Microsoft Fluent Emoji 3D (MIT) used in two places only: answer feedback (check / cross) and
 * leaderboard avatars. Files live in public/emoji3d/{slug}.webp, produced by `npm run emoji:fetch`
 * (scripts/fetch-emoji.mjs), which also rewrites emoji3d-manifest.json with the slugs it saved.
 * A slug missing from the manifest renders its plain text emoji instead (no 404s).
 */
import manifest from './emoji3d-manifest.json'

export interface EmojiDef {
  /** Fluent asset folder name, e.g. "Check mark button" */
  asset: string
  /** Text fallback */
  char: string
}

export const FEEDBACK_EMOJI = {
  correct: { asset: 'Check mark button', char: '✅' },
  wrong: { asset: 'Cross mark', char: '❌' },
  finish: { asset: 'Chequered flag', char: '🏁' },
} as const satisfies Record<string, EmojiDef>

/** Animal word in "Adjective Animal NN" → closest Fluent emoji. Keep in sync with convex/lib/names.ts. */
export const ANIMAL_EMOJI: Record<string, EmojiDef> = {
  Otter: { asset: 'Otter', char: '🦦' }, Falcon: { asset: 'Eagle', char: '🦅' }, Tiger: { asset: 'Tiger face', char: '🐯' },
  Panda: { asset: 'Panda', char: '🐼' }, Koala: { asset: 'Koala', char: '🐨' }, Fox: { asset: 'Fox', char: '🦊' },
  Wolf: { asset: 'Wolf', char: '🐺' }, Eagle: { asset: 'Eagle', char: '🦅' }, Hawk: { asset: 'Eagle', char: '🦅' },
  Owl: { asset: 'Owl', char: '🦉' }, Lynx: { asset: 'Cat face', char: '🐱' }, Badger: { asset: 'Badger', char: '🦡' },
  Beaver: { asset: 'Beaver', char: '🦫' }, Bison: { asset: 'Bison', char: '🦬' }, Camel: { asset: 'Camel', char: '🐪' },
  Cobra: { asset: 'Snake', char: '🐍' }, Coyote: { asset: 'Wolf', char: '🐺' }, Crane: { asset: 'Swan', char: '🦢' },
  Dingo: { asset: 'Dog face', char: '🐶' }, Dolphin: { asset: 'Dolphin', char: '🐬' }, Donkey: { asset: 'Horse face', char: '🐴' },
  Ferret: { asset: 'Otter', char: '🦦' }, Gecko: { asset: 'Lizard', char: '🦎' }, Gibbon: { asset: 'Orangutan', char: '🦧' },
  Gopher: { asset: 'Chipmunk', char: '🐿️' }, Heron: { asset: 'Flamingo', char: '🦩' }, Hippo: { asset: 'Hippopotamus', char: '🦛' },
  Hyena: { asset: 'Dog face', char: '🐶' }, Ibis: { asset: 'Flamingo', char: '🦩' }, Iguana: { asset: 'Lizard', char: '🦎' },
  Jackal: { asset: 'Fox', char: '🦊' }, Jaguar: { asset: 'Leopard', char: '🐆' }, Kiwi: { asset: 'Bird', char: '🐦' },
  Lemur: { asset: 'Monkey face', char: '🐵' }, Llama: { asset: 'Llama', char: '🦙' }, Lobster: { asset: 'Lobster', char: '🦞' },
  Magpie: { asset: 'Bird', char: '🐦' }, Marmot: { asset: 'Hamster', char: '🐹' }, Moose: { asset: 'Deer', char: '🦌' },
  Narwhal: { asset: 'Spouting whale', char: '🐳' }, Ocelot: { asset: 'Leopard', char: '🐆' }, Orca: { asset: 'Whale', char: '🐋' },
  Osprey: { asset: 'Eagle', char: '🦅' }, Panther: { asset: 'Leopard', char: '🐆' }, Parrot: { asset: 'Parrot', char: '🦜' },
  Pelican: { asset: 'Duck', char: '🦆' }, Penguin: { asset: 'Penguin', char: '🐧' }, Puffin: { asset: 'Penguin', char: '🐧' },
  Python: { asset: 'Snake', char: '🐍' }, Quokka: { asset: 'Kangaroo', char: '🦘' }, Rabbit: { asset: 'Rabbit face', char: '🐰' },
  Raven: { asset: 'Bird', char: '🐦' }, Salmon: { asset: 'Fish', char: '🐟' }, Shark: { asset: 'Shark', char: '🦈' },
  Sloth: { asset: 'Sloth', char: '🦥' }, Walrus: { asset: 'Seal', char: '🦭' }, Weasel: { asset: 'Otter', char: '🦦' },
  Wombat: { asset: 'Koala', char: '🐨' }, Yak: { asset: 'Water buffalo', char: '🐃' }, Zebra: { asset: 'Zebra', char: '🦓' },
}

/** Fun pool for chosen names (picked by a stable hash of the name). */
export const AVATAR_POOL: EmojiDef[] = [
  { asset: 'Rocket', char: '🚀' }, { asset: 'Fire', char: '🔥' }, { asset: 'Glowing star', char: '🌟' },
  { asset: 'Crown', char: '👑' }, { asset: 'Brain', char: '🧠' }, { asset: 'Alien', char: '👽' },
  { asset: 'Robot', char: '🤖' }, { asset: 'Ghost', char: '👻' }, { asset: 'Unicorn', char: '🦄' },
  { asset: 'Grinning cat', char: '😺' }, { asset: 'Cat face', char: '🐱' }, { asset: 'Smiling cat with heart-eyes', char: '😻' },
  { asset: 'Cat with wry smile', char: '😼' }, { asset: 'Dragon face', char: '🐲' }, { asset: 'T-rex', char: '🦖' },
  { asset: 'Octopus', char: '🐙' }, { asset: 'Butterfly', char: '🦋' }, { asset: 'Lady beetle', char: '🐞' },
  { asset: 'Honeybee', char: '🐝' }, { asset: 'Rainbow', char: '🌈' }, { asset: 'Sun with face', char: '🌞' },
  { asset: 'Comet', char: '☄️' }, { asset: 'High voltage', char: '⚡' }, { asset: 'Gem stone', char: '💎' },
  { asset: 'Party popper', char: '🎉' }, { asset: 'Balloon', char: '🎈' }, { asset: 'Video game', char: '🎮' },
  { asset: 'Joystick', char: '🕹️' }, { asset: 'Puzzle piece', char: '🧩' }, { asset: 'Teddy bear', char: '🧸' },
  { asset: 'Lollipop', char: '🍭' }, { asset: 'Doughnut', char: '🍩' }, { asset: 'Pizza', char: '🍕' },
  { asset: 'Avocado', char: '🥑' }, { asset: 'Cactus', char: '🌵' }, { asset: 'Four leaf clover', char: '🍀' },
  { asset: 'Mushroom', char: '🍄' }, { asset: 'Sparkles', char: '✨' }, { asset: 'Snowman', char: '☃️' },
  { asset: 'Hot beverage', char: '☕' },
]

/** "Check mark button" → "check_mark_button" (matches the repo's file naming). */
export function emojiSlug(asset: string): string {
  return asset.toLowerCase().replace(/ /g, '_')
}

const AVAILABLE = new Set<string>(manifest as string[])

/** URL of the local WebP, or null when it has not been fetched (render the text emoji). */
export function emojiSrc(def: EmojiDef): string | null {
  const slug = emojiSlug(def.asset)
  return AVAILABLE.has(slug) ? `/emoji3d/${slug}.webp` : null
}

function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const GENERATED = /^[A-Za-z]+ ([A-Za-z]+) \d{2}$/

/** Generated "Adjective Animal NN" → that animal; any other (chosen) name → a stable pick from the pool. */
export function avatarEmojiFor(name: string): EmojiDef {
  const animal = GENERATED.exec(name.trim())?.[1]
  if (animal && ANIMAL_EMOJI[animal]) return ANIMAL_EMOJI[animal]
  return AVATAR_POOL[hash(name.trim().toLowerCase()) % AVATAR_POOL.length]
}

/** Every asset the fetch script must download (deduplicated). */
export function allEmojiAssets(): string[] {
  return [...new Set([...Object.values(FEEDBACK_EMOJI), ...Object.values(ANIMAL_EMOJI), ...AVATAR_POOL].map((d) => d.asset))]
}
