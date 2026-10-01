import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

const getOnline = () => navigator.onLine
const getServerOnline = () => true

/** navigator.onLine, kept live via the online/offline events. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getOnline, getServerOnline)
}
