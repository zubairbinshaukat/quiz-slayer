// Fetches the Microsoft Fluent Emoji 3D PNGs the app uses (feedback check/cross + leaderboard
// avatars), converts them to 128px WebP in public/emoji3d/, and rewrites
// src/lib/emoji3d-manifest.json with the slugs that were saved. Run: npm run emoji:fetch
// Asset names are read from src/lib/emoji3d.ts (every `asset: '…'` entry), so that file is the
// single source of truth. Fluent Emoji is MIT licensed (see public/emoji3d/LICENSE.txt).
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = new URL('../', import.meta.url)
const OUT = new URL('public/emoji3d/', ROOT)
const BASE = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets'

const source = await readFile(new URL('src/lib/emoji3d.ts', ROOT), 'utf8')
const assets = [...new Set([...source.matchAll(/asset: '([^']+)'/g)].map((m) => m[1]))].sort()

await mkdir(OUT, { recursive: true })

const saved = []
const failed = []
for (const name of assets) {
  const slug = name.toLowerCase().replace(/ /g, '_')
  const url = `${BASE}/${encodeURIComponent(name)}/3D/${encodeURIComponent(slug)}_3d.png`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      failed.push(`${name} → HTTP ${res.status} (${url})`)
      continue
    }
    const png = Buffer.from(await res.arrayBuffer())
    await sharp(png)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 88, alphaQuality: 100 })
      .toFile(fileURLToPath(new URL(`${slug}.webp`, OUT)))
    saved.push(slug)
    console.log(`ok   ${name}`)
  } catch (err) {
    failed.push(`${name} → ${err instanceof Error ? err.message : String(err)}`)
  }
}

await writeFile(new URL('src/lib/emoji3d-manifest.json', ROOT), `${JSON.stringify(saved.sort(), null, 2)}\n`)

console.log(`\nSaved ${saved.length}/${assets.length} emoji to public/emoji3d/`)
if (failed.length > 0) {
  console.error(`\nNot found (pick a substitute asset name in src/lib/emoji3d.ts and re-run):\n  ${failed.join('\n  ')}`)
  process.exitCode = 1
}
