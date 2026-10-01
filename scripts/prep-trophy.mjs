// One-off: turns the owner-supplied public/trophy-gold.png (white background) into transparent
// WebPs for the tab bar: public/icons3d/trophy-gold.webp (128px) and trophy-gold@1x.webp (64px).
// Usage: node scripts/prep-trophy.mjs [path/to/trophy-gold.png]
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const input = process.argv[2] ?? fileURLToPath(new URL('public/trophy-gold.png', root))
const out = (name) => fileURLToPath(new URL(`public/icons3d/${name}`, root))

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

// Near-white → transparent, with a soft ramp so anti-aliased edges don't keep a white halo
const HARD = 245
const SOFT = 215
for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const min = Math.min(r, g, b)
  const spread = Math.max(r, g, b) - min
  if (spread > 40) continue // saturated (gold) pixel: keep
  if (min >= HARD) data[i + 3] = 0
  else if (min >= SOFT) data[i + 3] = Math.round((data[i + 3] * (HARD - min)) / (HARD - SOFT))
}

const cutout = await sharp(data, { raw: info }).png().toBuffer()
const trimmed = await sharp(cutout).trim().toBuffer()

for (const [name, size] of [['trophy-gold.webp', 128], ['trophy-gold@1x.webp', 64]]) {
  await sharp(trimmed)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out(name))
  console.log(`wrote public/icons3d/${name}`)
}
