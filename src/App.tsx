import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Preloader } from './components/brand/Preloader'
import { DeviceLinkHost } from './components/devices/DeviceLinkHost'
import { Navbar } from './components/layout/Navbar'
import { TabBar } from './components/layout/TabBar'
import { UpdatePrompt } from './components/pwa/UpdatePrompt'
import { QuizProvider } from './context/QuizContext'
import { SoundProvider } from './context/SoundContext'
import { useLiteMode } from './hooks/useLiteMode'
import { convexEnabled } from './lib/convex'

/** Root layout: providers + chrome. Quiz routes run in a chrome-less focus mode. */
export function AppShell() {
  const { pathname } = useLocation()
  const { lite } = useLiteMode()
  const focusMode = pathname.startsWith('/quiz/')

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
        {!focusMode && <Navbar />}
        <Outlet />
        {!focusMode && <TabBar />}
        <UpdatePrompt />
        {convexEnabled && <DeviceLinkHost />}
        <ScrollRestoration />
      </QuizProvider>
    </SoundProvider>
  )
}
