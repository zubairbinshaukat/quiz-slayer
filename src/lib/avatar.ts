function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Two-stop diagonal gradient hashed from the name (light enough for dark initials). */
export function avatarGradient(name: string): string {
  const h = hash(name.toLowerCase())
  const hue = h % 360
  const shift = 30 + ((h >>> 9) % 50)
  return `linear-gradient(135deg, hsl(${hue} 85% 72%), hsl(${(hue + shift) % 360} 75% 58%))`
}

/** Up to two initials: "Brave Otter 42" → "BO". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => /[a-z]/i.test(w))
  const letters = (words.length > 1 ? [words[0], words[1]] : [words[0] ?? name]).map((w) => w.charAt(0))
  return letters.join('').toUpperCase() || '?'
}
