import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Preloader } from './components/brand/Preloader'
import { DeviceLinkHost } from './components/devices/DeviceLinkHost'
import { Navbar } from './components/layout/Navbar'
import { SettingsSheet } from './components/layout/SettingsSheet'
import { Sidebar } from './components/layout/Sidebar'
import { TabBar } from './components/layout/TabBar'
import { UpdatePrompt } from './components/pwa/UpdatePrompt'
import { QuizProvider } from './context/QuizContext'
import { SoundProvider } from './context/SoundContext'
import { useLiteMode } from './hooks/useLiteMode'
import { convexEnabled } from './lib/convex'
import { RELOADED_ONCE_KEY } from './lib/storageKeys'
import { cn } from './lib/utils'

const AdminPinSheet = lazy(() => import('./components/admin/AdminPinSheet').then((m) => ({ default: m.AdminPinSheet })))

const SECRET_TAPS = 7
const SECRET_WINDOW_MS = 4000

/** Root layout: providers + chrome. Quiz routes run in a chrome-less focus mode. */
export function AppShell() {
  const { pathname } = useLocation()
  const { lite } = useLiteMode()
  const focusMode = pathname.startsWith('/quiz/')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const taps = useRef<number[]>([])

  // The shell rendered: a chunk-load auto-reload (ErrorPage) may happen again in future
  useEffect(() => {
    try {
      sessionStorage.removeItem(RELOADED_ONCE_KEY)
    } catch { /* ignore */ }
  }, [])

  // Owner entry: 7 taps on the logo within 4 s opens the stats PIN prompt
  function onLogoTap() {
    if (!convexEnabled) return
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < SECRET_WINDOW_MS), now]
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = []
      setPinOpen(true)
    }
  }

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
        {!lite && <Preloader />}
        {!focusMode && <Sidebar onOpenSettings={openSettings} onLogoTap={onLogoTap} />}
        <div className={cn(!focusMode && 'lg:pl-[76px]')}>
          {!focusMode && <Navbar onOpenSettings={openSettings} onLogoTap={onLogoTap} />}
          <Outlet />
        </div>
        {!focusMode && <TabBar />}
        <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        {pinOpen && (
          <Suspense fallback={null}>
            <AdminPinSheet onClose={() => setPinOpen(false)} />
          </Suspense>
        )}
        <UpdatePrompt />
        {convexEnabled && <DeviceLinkHost />}
        <ScrollRestoration />
      </QuizProvider>
    </SoundProvider>
  )
}
