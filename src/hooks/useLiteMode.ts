import { useContext } from 'react'
import { LiteModeContext, type LiteModeContextValue } from '../context/liteModeContextDef'

export function useLiteMode(): LiteModeContextValue {
  const ctx = useContext(LiteModeContext)
  if (!ctx) throw new Error('useLiteMode must be used inside <LiteModeProvider>')
  return ctx
}
