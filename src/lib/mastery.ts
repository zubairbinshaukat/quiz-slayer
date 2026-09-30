import { getMistakeIds } from './mistakes'
import type { HistoryEntry } from '../types'

/**
 * Question ids answered correctly at least once for a subject that are not
 * currently open mistakes. Entries without id data are ignored.
 */
export function getMasteredCount(history: HistoryEntry[], slug: string): number {
  const correct = new Set<string>()
  for (const entry of history) {
    if (entry.slug !== slug || !entry.questionIds) continue
    const wrong = new Set(entry.wrongIds ?? [])
    for (const id of entry.questionIds) if (!wrong.has(id)) correct.add(id)
  }
  if (correct.size === 0) return 0
  const open = new Set(getMistakeIds(history, slug))
  let count = 0
  for (const id of correct) if (!open.has(id)) count++
  return count
}

/** Total open mistakes across every subject that appears in history. */
export function getTotalMistakes(history: HistoryEntry[]): number {
  const slugs = new Set(history.map((e) => e.slug))
  let total = 0
  for (const slug of slugs) total += getMistakeIds(history, slug).length
  return total
}
