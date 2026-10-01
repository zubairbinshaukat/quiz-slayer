import { SUBJECT_ICONS, type Icon3DName } from './icons3d'
import type { Question } from '../types'

/** djb2-style hash — deterministic, stable across runs */
function slugHash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Topic keywords that deserve a specific icon; everything else falls back to the slug hash. */
const KEYWORD_ICONS: [RegExp, Icon3DName][] = [
  [/secur|cyber|crypt|privacy/, 'sheild'],
  [/math|calc|stat|algebra|account|financ/, 'calculator'],
  [/program|comput|software|web|data|network/, 'computer'],
  [/chem|bio|physic|lab|science/, 'lab'],
  [/english|writ|essay|literat/, 'pencil'],
  [/business|market|manag|econom/, 'chart'],
]

/** Returns the same 3D icon every time for the same slug */
export function getSubjectIcon(slug: string): Icon3DName {
  const s = slug.toLowerCase()
  for (const [re, icon] of KEYWORD_ICONS) if (re.test(s)) return icon
  return SUBJECT_ICONS[(slugHash(slug) >>> 4) % SUBJECT_ICONS.length]
}

/** Stable 0–359 hue for a subject's tint (same hash as the icon). */
export function getSubjectHue(slug: string): number {
  return slugHash(slug) % 360
}

/** Every question of a subject (main + guess), first occurrence of an id wins. */
export function allSubjectQuestions(subject: { questions: Question[]; guessQuestions: Question[] }): Question[] {
  const seen = new Set<string>()
  const out: Question[] = []
  for (const q of [...subject.questions, ...subject.guessQuestions]) {
    const id = String(q.id)
    if (seen.has(id)) continue
    seen.add(id)
    out.push(q)
  }
  return out
}
