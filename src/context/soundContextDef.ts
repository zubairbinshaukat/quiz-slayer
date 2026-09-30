import { createContext } from 'react'

export type SoundName = 'Correct' | 'Incorrect'

export interface SoundContextValue {
  soundEnabled: boolean
  toggleSound: () => void
  playSound: (name: SoundName) => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)
