import { useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { DeviceLinkHost } from './components/devices/DeviceLinkHost'
import { Navbar } from './components/layout/Navbar'
import { SettingsSheet } from './components/layout/SettingsSheet'
import { Sidebar } from './components/layout/Sidebar'
import { TabBar } from './components/layout/TabBar'
import { UpdatePrompt } from './components/pwa/UpdatePrompt'
import { QuizProvider } from './context/QuizContext'
import { SoundProvider } from './context/SoundContext'
import { convexEnabled } from './lib/convex'
import { releaseSplash, replaySplash } from './lib/splash'
import { RELOADED_ONCE_KEY } from './lib/storageKeys'
import { cn } from './lib/utils'

/** Root layout: providers + chrome. Quiz routes run in a chrome-less focus mode. */
export function AppShell() {
  const { pathname } = useLocation()
  const focusMode = pathname.startsWith('/quiz/')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // The shell rendered (the data router waits for the route chunk first): hand over from the
  // index.html splash, and allow a chunk-load auto-reload (ErrorPage) again in future
  useEffect(() => {
    releaseSplash()
    try {
      sessionStorage.removeItem(RELOADED_ONCE_KEY)
    } catch { /* ignore */ }
  }, [])

  // Arriving on home from another page (back button, logo, Home tab) replays the splash's short cut
  const prevPath = useRef(pathname)
  useEffect(() => {
    if (pathname === '/' && prevPath.current !== '/') replaySplash()
    prevPath.current = pathname
  }, [pathname])

  const openSettings = () => setSettingsOpen(true)

  return (
    <SoundProvider>
      <QuizProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-btn focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-ink"
        >
          Skip to content
        </a>
        {!focusMode && <Sidebar onOpenSettings={openSettings} />}
        <div className={cn(!focusMode && 'lg:pl-[76px]')}>
          {!focusMode && <Navbar onOpenSettings={openSettings} />}
          <Outlet />
        </div>
        {!focusMode && <TabBar />}
        <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <UpdatePrompt />
        {convexEnabled && <DeviceLinkHost />}
        <ScrollRestoration />
      </QuizProvider>
    </SoundProvider>
  )
}
