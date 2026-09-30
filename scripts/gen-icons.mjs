#!/usr/bin/env node
/**
 * Quiz Slayer icon generator (logo-forge pipeline).
 *
 * Rasterises the flattened brand SVGs in branding/ (hex colours baked in) into
 * every favicon / PWA / social asset in public/, then verifies the pixel sizes.
 *
 *   branding/icon-favicon.svg  -> public/favicon.svg (copy), public/favicon.ico (16/32/48)
 *   branding/icon-app.svg      -> public/apple-touch-icon.png (180), public/pwa-192x192.png, public/pwa-512x512.png
 *   branding/icon-maskable.svg -> public/pwa-maskable-512x512.png
 *   branding/og-image.svg      -> public/og-image.png (1200x630)
 *
 * Canonical mark: branding/logo.svg (and src/components/brand/Logo.tsx).
 * Usage: npm run icons
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const B = (p) => resolve('branding', p);
const P = (p) => resolve('public', p);
const OBSIDIAN = '#0B0B0F';
const AMBER = '#F5B73A';

/** Render an SVG to an exact-size PNG buffer, rasterising at the native target resolution. */
async function render(src, width, height = width, background) {
  const svg = readFileSync(src);
  const vbWidth = Number(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+)/.exec(svg.toString())?.[1] ?? width);
  let img = sharp(svg, { density: Math.min(2400, (72 * width) / vbWidth) }).resize(width, height, { fit: 'fill' });
  if (background) img = img.flatten({ background }); // opaque RGB, no alpha channel
  return img.png({ compressionLevel: 9 }).toBuffer();
}

/** Minimal ICO writer: PNG-compressed entries (supported by every browser since IE Vista-era). */
function pngsToIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); // palette
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bpp
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
}

const jobs = [
  { src: 'icon-app.svg', out: 'apple-touch-icon.png', w: 180, bg: OBSIDIAN },
  { src: 'icon-app.svg', out: 'pwa-192x192.png', w: 192, bg: OBSIDIAN },
  { src: 'icon-app.svg', out: 'pwa-512x512.png', w: 512, bg: OBSIDIAN },
  { src: 'icon-maskable.svg', out: 'pwa-maskable-512x512.png', w: 512, bg: AMBER },
  { src: 'og-image.svg', out: 'og-image.png', w: 1200, h: 630, bg: OBSIDIAN },
];

let failed = false;
const results = [];

for (const j of jobs) {
  const h = j.h ?? j.w;
  const buf = await render(B(j.src), j.w, h, j.bg);
  writeFileSync(P(j.out), buf);
  const meta = await sharp(buf).metadata();
  const ok = meta.width === j.w && meta.height === h;
  failed ||= !ok;
  results.push(`${ok ? 'ok ' : 'BAD'} public/${j.out}  ${meta.width}x${meta.height}  (${(buf.length / 1024).toFixed(1)} KB)`);
}

// favicon.svg is the vector source itself; favicon.ico packs 16/32/48 renders of it.
copyFileSync(B('icon-favicon.svg'), P('favicon.svg'));
results.push('ok  public/favicon.svg  vector');
const icoEntries = [];
for (const size of [16, 32, 48]) {
  const buf = await render(B('icon-favicon.svg'), size);
  const meta = await sharp(buf).metadata();
  failed ||= meta.width !== size || meta.height !== size;
  icoEntries.push({ size, buf });
}
writeFileSync(P('favicon.ico'), pngsToIco(icoEntries));
results.push(`ok  public/favicon.ico  ${icoEntries.map((e) => `${e.size}x${e.size}`).join(', ')}`);

console.log(results.join('\n'));
if (failed) {
  console.error('\nSize verification failed.');
  process.exit(1);
}
console.log('\nAll icon sizes verified. Hard-refresh / reinstall the PWA to see new icons (browsers cache favicons aggressively).');
