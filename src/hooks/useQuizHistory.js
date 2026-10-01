import { useCallback, useEffect, useState } from 'react'
import { clearAllHistory, deleteHistoryEntry, getAllHistory } from '../lib/db'

export function useQuizHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const entries = await getAllHistory()
    setHistory(entries)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const removeEntry = useCallback(async (id) => {
    await deleteHistoryEntry(id)
    setHistory((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearHistory = useCallback(async () => {
    await clearAllHistory()
    setHistory([])
  }, [])

  return { history, loading, removeEntry, clearHistory, reload: load }
}
