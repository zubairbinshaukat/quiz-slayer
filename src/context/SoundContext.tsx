import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { SOUND_KEY } from '../lib/storageKeys'
import { SoundContext, type SoundName } from './soundContextDef'

function readSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'true'
  } catch {
    return false
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(readSoundEnabled)

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SOUND_KEY, String(next))
      } catch { /* storage unavailable */ }
      return next
    })
  }, [])

  const playSound = useCallback((name: SoundName) => {
    if (!soundEnabled) return
    try {
      const audio = new Audio(`/sounds/${name}.mp3`)
      audio.play().catch(() => {})
    } catch { /* audio unavailable */ }
  }, [soundEnabled])

  const value = useMemo(
    () => ({ soundEnabled, toggleSound, playSound }),
    [soundEnabled, toggleSound, playSound],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
