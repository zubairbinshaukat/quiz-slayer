import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { applyLite, LITE_DETECTED, readLitePref, resolveLite, writeLitePref, type LitePref } from '../lib/liteMode'
import { LiteModeContext } from './liteModeContextDef'

export function LiteModeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<LitePref>(readLitePref)
  const lite = resolveLite(pref)

  useEffect(() => {
    applyLite(lite)
  }, [lite])

  const setPref = useCallback((next: LitePref) => {
    writeLitePref(next)
    setPrefState(next)
  }, [])

  const value = useMemo(() => ({ pref, detected: LITE_DETECTED, lite, setPref }), [pref, lite, setPref])

  return <LiteModeContext.Provider value={value}>{children}</LiteModeContext.Provider>
}
