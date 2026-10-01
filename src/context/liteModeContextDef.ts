import { createContext } from 'react'
import type { LitePref } from '../lib/liteMode'

export interface LiteModeContextValue {
  /** Saved preference */
  pref: LitePref
  /** What auto-detection decided for this device */
  detected: boolean
  /** Effective state */
  lite: boolean
  setPref: (pref: LitePref) => void
}

export const LiteModeContext = createContext<LiteModeContextValue | null>(null)
