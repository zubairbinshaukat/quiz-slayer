import { createContext, useCallback, useContext, useState } from 'react'

const SoundContext = createContext(null)

export function SoundProvider({ children }) {
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

  const playSound = useCallback((name) => {
    if (!soundEnabled) return
    try {
      const audio = new Audio(`/sounds/${name}.mp3`)
      audio.play().catch(() => {})
    } catch {}
  }, [soundEnabled])

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  return useContext(SoundContext)
}
