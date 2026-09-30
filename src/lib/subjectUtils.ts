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

/** Returns the same 3D icon every time for the same slug */
export function getSubjectIcon(slug: string): Icon3DName {
  return SUBJECT_ICONS[(slugHash(slug) >>> 4) % SUBJECT_ICONS.length]
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
