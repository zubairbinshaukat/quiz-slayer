import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { SoundContext, type SoundName } from './soundContextDef'

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('sound-enabled') === 'true'
  )

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem('sound-enabled', String(next))
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
