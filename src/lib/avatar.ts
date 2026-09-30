const AVATAR_COLORS = [
  '#F5B73A', '#3DDC97', '#6EA8FF', '#FF7A7A', '#B794F6',
  '#4FD1C5', '#F687B3', '#F6AD55', '#9AE6B4', '#90CDF4',
] as const

function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function avatarColor(name: string): string {
  return AVATAR_COLORS[hash(name.toLowerCase()) % AVATAR_COLORS.length]
}

/** Up to two initials: "Brave Otter 42" → "BO". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => /[a-z]/i.test(w))
  const letters = (words.length > 1 ? [words[0], words[1]] : [words[0] ?? name]).map((w) => w.charAt(0))
  return letters.join('').toUpperCase() || '?'
}
