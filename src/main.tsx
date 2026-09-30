import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import type { LenisOptions } from 'lenis'
import { ReactLenis } from 'lenis/react'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { MaybeConvexProvider } from './components/providers/MaybeConvexProvider'
import { ThemeProvider } from './context/ThemeContext'
import { router } from './router'
import './styles/index.css'

// Lenis is mounted at the root but only smooths the long browsing pages;
// everywhere else `prevent` hands scrolling back to the browser.
const SMOOTH_SCROLL_PATHS = new Set(['/', '/history', '/leaderboard'])
const lenisOptions: LenisOptions = {
  prevent: () => !SMOOTH_SCROLL_PATHS.has(window.location.pathname),
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <MaybeConvexProvider>
      <ReactLenis root options={lenisOptions}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ReactLenis>
    </MaybeConvexProvider>
  </StrictMode>,
)
