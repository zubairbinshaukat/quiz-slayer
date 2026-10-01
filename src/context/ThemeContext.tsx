import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { THEME_KEY } from '../lib/storageKeys'
import { ThemeContext, type Theme, type ThemePref } from './themeContextDef'

/** Must match --color-bg for each theme in styles/index.css */
const THEME_COLOR: Record<Theme, string> = { dark: '#0B0B0F', light: '#F6F4EE' }
const LIGHT_QUERY = '(prefers-color-scheme: light)'

function readInitialPref(): ThemePref {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
  } catch { /* storage unavailable */ }
  // Dark-first: light only when the user picks it (or picks System on a light OS)
  return 'dark'
}

function subscribeScheme(onChange: () => void): () => void {
  const mq = window.matchMedia?.(LIGHT_QUERY)
  mq?.addEventListener('change', onChange)
  return () => mq?.removeEventListener('change', onChange)
}

function systemPrefersLight(): boolean {
  return window.matchMedia?.(LIGHT_QUERY).matches ?? false
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<ThemePref>(readInitialPref)
  const osLight = useSyncExternalStore(subscribeScheme, systemPrefersLight, () => false)
  const theme: Theme = pref === 'system' ? (osLight ? 'light' : 'dark') : pref

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, pref)
    } catch { /* ignore */ }
  }, [pref])

  const toggleTheme = useCallback(() => {
    setPref(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  const value = useMemo(() => ({ theme, pref, setPref, toggleTheme }), [theme, pref, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
