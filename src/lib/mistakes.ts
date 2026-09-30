import type { HistoryEntry } from '../types'

/**
 * Ids currently "open" as mistakes for a subject: wrong in some attempt and not
 * answered correctly in a later attempt. Entries lacking id data are ignored.
 */
export function getMistakeIds(history: HistoryEntry[], slug: string): string[] {
  const entries = history
    .filter((e) => e.slug === slug && e.questionIds && e.wrongIds)
    .sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())

  const open = new Set<string>()
  for (const entry of entries) {
    const wrong = new Set(entry.wrongIds ?? [])
    for (const id of entry.questionIds ?? []) {
      if (wrong.has(id)) open.add(id)
      else open.delete(id)
    }
    for (const id of wrong) open.add(id)
  }
  return [...open]
}

export interface SubjectStats {
  attempts: number
  best: number
  last: number
  average: number
}

export function getSubjectStats(history: HistoryEntry[], slug: string): SubjectStats {
  const entries = history
    .filter((e) => e.slug === slug)
    .sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime())
  if (entries.length === 0) return { attempts: 0, best: 0, last: 0, average: 0 }
  const scores = entries.map((e) => e.score)
  return {
    attempts: entries.length,
    best: Math.max(...scores),
    last: scores[0],
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }
}