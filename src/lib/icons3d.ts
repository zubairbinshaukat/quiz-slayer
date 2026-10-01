/** 3D icon set shipped in public/icons3d (CC0). `sheild` is the asset's spelling. */
export const ICON3D_NAMES = [
  'trophy', 'medal', 'star', 'fire', 'rocket', 'bulb', 'target', 'chart', 'clock',
  'notebook', 'lock', 'flash', 'sheild', 'puzzle', 'tick', 'calculator', 'computer',
  'key', 'chat', 'flag', 'thumb-up', 'cup', 'magic-trick', 'lab', 'file-text',
  'pencil', 'bookmark', 'gift', 'sun', 'moon',
] as const

export type Icon3DName = (typeof ICON3D_NAMES)[number]
export type Icon3DStyle = 'clay' | 'premium'

/** Icons suitable for representing a subject. Order drives the slug → icon hash. */
export const SUBJECT_ICONS: readonly Icon3DName[] = [
  'notebook', 'computer', 'calculator', 'lab', 'bulb', 'puzzle', 'key', 'sheild',
  'chart', 'rocket', 'pencil', 'file-text', 'magic-trick', 'flash', 'target', 'chat',
]

/** `premium` (full colour) is the app style; `clay` is kept only as an asset option. */
export function icon3dSrc(name: Icon3DName, style: Icon3DStyle = 'premium', density: 1 | 2 = 2): string {
  return `/icons3d/${name}-${style}${density === 1 ? '@1x' : ''}.webp`
}
