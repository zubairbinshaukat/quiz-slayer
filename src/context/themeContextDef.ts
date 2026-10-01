import { createContext } from 'react'

/** Resolved theme actually painted. */
export type Theme = 'light' | 'dark'
/** User choice; 'system' follows prefers-color-scheme. */
export type ThemePref = 'system' | 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  pref: ThemePref
  setPref: (pref: ThemePref) => void
  /** Flips between dark and light (leaves 'system'). */
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
