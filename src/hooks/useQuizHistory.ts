import { useCallback, useEffect, useState } from 'react'
import { clearAllHistory, deleteHistoryEntry, getAllHistory } from '../lib/db'
import type { HistoryEntry } from '../types'

let snapshot: HistoryEntry[] | null = null

/**
 * Route loader: reads history while the route chunk downloads, so the page's first render already
 * has it (no banners or tiles popping in and shifting the layout).
 */
export async function primeHistory(): Promise<null> {
  snapshot = await getAllHistory()
  return null
}

export function useQuizHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => snapshot ?? [])
  const [loading, setLoading] = useState(() => snapshot === null)

  const load = useCallback(async () => {
    setLoading(true)
    const entries = await getAllHistory()
    setHistory(entries)
    setLoading(false)
  }, [])

  // Initial load (state is only set asynchronously, after IndexedDB resolves)
  useEffect(() => {
    let cancelled = false
    void getAllHistory().then((entries) => {
      if (cancelled) return
      setHistory(entries)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const removeEntry = useCallback(async (id: number) => {
    await deleteHistoryEntry(id)
    setHistory((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearHistory = useCallback(async () => {
    await clearAllHistory()
    setHistory([])
  }, [])

  return { history, loading, removeEntry, clearHistory, reload: load }
}
