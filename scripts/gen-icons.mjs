#!/usr/bin/env node
/**
 * Quiz Slayer icon generator.
 *
 * Source of truth: branding/logo-3d-source.png (the 3D "sword through a question mark" mark,
 * transparent background). Everything below is derived from it, then the pixel sizes are verified.
 *
 *   in-app mark  -> public/logo-3d-96.webp, public/logo-3d-384.webp (trimmed, transparent; height = the number)
 *   app icons    -> public/apple-touch-icon.png (180), public/pwa-192x192.png, public/pwa-512x512.png
 *                   (mark on the amber backdrop, full-bleed)
 *   maskable     -> public/pwa-maskable-512x512.png (same, mark inside the 80% safe zone)
 *   favicon      -> public/favicon.ico (16/32/48), public/favicon-96.png
 *                   (same amber backdrop as a rounded tile: the dark mark stays readable at 16px on light and dark tabs)
 *   social       -> public/og-image.png (1200x630): branding/og-image.svg + the mark
 *
 * Usage: npm run icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const B = (p) => resolve('branding', p);
const P = (p) => resolve('public', p);

const svg = (size, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${body}</svg>`);

// Amber backdrop shared by the app icons and the favicon tile
const BACKDROP = '<radialGradient id="g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#FFD67A"/><stop offset="1" stop-color="#F0A520"/></radialGradient>';

const mark = await sharp(B('logo-3d-source.png')).trim().toBuffer();

/** Square icon: amber backdrop + the mark scaled to `scale` of the edge; `radius` > 0 rounds the corners (transparent). */
async function tile(size, scale, radius = 0) {
  const inner = Math.round(size * scale);
  const fg = await sharp(mark).resize(inner, inner, { fit: 'inside' }).toBuffer();
  const bg = svg(size, `<defs>${BACKDROP}</defs><rect width="${size}" height="${size}" fill="url(#g)"/>`);
  let img = sharp(bg).composite([{ input: fg, gravity: 'centre' }]);
  if (radius > 0) {
    const flat = await img.png().toBuffer();
    const mask = svg(size, `<rect width="${size}" height="${size}" rx="${size * radius}" fill="#fff"/>`);
    return sharp(flat).composite([{ input: mask, blend: 'dest-in' }]).png({ compressionLevel: 9 }).toBuffer();
  }
  // Opaque RGB for home-screen icons (no alpha channel)
  return img.flatten({ background: '#F5B73A' }).png({ compressionLevel: 9 }).toBuffer();
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

let failed = false;
const results = [];

async function save(out, buf, w, h = w) {
  writeFileSync(P(out), buf);
  const meta = await sharp(buf).metadata();
  const ok = meta.width === w && meta.height === h;
  failed ||= !ok;
  results.push(`${ok ? 'ok ' : 'BAD'} public/${out}  ${meta.width}x${meta.height}  (${(buf.length / 1024).toFixed(1)} KB)`);
}

// In-app mark (transparent, trimmed; the number is the height)
for (const h of [96, 384]) {
  const buf = await sharp(mark).resize({ height: h }).webp({ quality: 90, alphaQuality: 100 }).toBuffer();
  const meta = await sharp(buf).metadata();
  await save(`logo-3d-${h}.webp`, buf, meta.width, h);
}

// Home-screen icons
await save('apple-touch-icon.png', await tile(180, 0.78), 180);
await save('pwa-192x192.png', await tile(192, 0.78), 192);
await save('pwa-512x512.png', await tile(512, 0.78), 512);
await save('pwa-maskable-512x512.png', await tile(512, 0.58), 512);

// Favicons
await save('favicon-96.png', await tile(96, 0.86, 0.22), 96);
const icoEntries = [];
for (const size of [16, 32, 48]) {
  const buf = await tile(size, 0.86, 0.22);
  const meta = await sharp(buf).metadata();
  failed ||= meta.width !== size || meta.height !== size;
  icoEntries.push({ size, buf });
}
writeFileSync(P('favicon.ico'), pngsToIco(icoEntries));
results.push(`ok  public/favicon.ico  ${icoEntries.map((e) => `${e.size}x${e.size}`).join(', ')}`);

// Social card: the SVG carries the background, glow and text; the mark sits on the glow, clear of the title
const OG_MARK_H = 230;
const ogMark = await sharp(mark).resize({ height: OG_MARK_H }).toBuffer();
const ogMarkW = (await sharp(ogMark).metadata()).width;
const og = await sharp(readFileSync(B('og-image.svg')), { density: 72 })
  .resize(1200, 630, { fit: 'fill' })
  .composite([{ input: ogMark, left: Math.round(600 - ogMarkW / 2), top: Math.round(188 - OG_MARK_H / 2) }])
  .flatten({ background: '#0B0B0F' })
  .png({ compressionLevel: 9 })
  .toBuffer();
await save('og-image.png', og, 1200, 630);

console.log(results.join('\n'));
if (failed) {
  console.error('\nSize verification failed.');
  process.exit(1);
}
console.log('\nAll icon sizes verified. Hard-refresh / reinstall the PWA to see new icons (browsers cache favicons aggressively).');
