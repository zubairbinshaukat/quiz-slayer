import { useContext } from 'react'
import { SoundContext, type SoundContextValue } from '../context/soundContextDef'

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used inside <SoundProvider>')
  return ctx
}
