import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { MaybeConvexProvider } from './components/providers/MaybeConvexProvider'
import { SmoothScroll } from './components/providers/SmoothScroll'
import { LiteModeProvider } from './context/LiteModeContext'
import { ThemeProvider } from './context/ThemeContext'
import { startOutboxSync } from './lib/attemptSink'
import { initInstallPrompt } from './lib/installPrompt'
import { initLiteMode } from './lib/liteMode'
import { router } from './router'
import './styles/index.css'

// Before the first render: data-lite on <html>, and listen for the install prompt early.
initLiteMode()
initInstallPrompt()
// Send any attempts queued while offline (no-op without Convex).
startOutboxSync()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <MaybeConvexProvider>
      <LiteModeProvider>
        <ThemeProvider>
          <SmoothScroll />
          <RouterProvider router={router} />
        </ThemeProvider>
      </LiteModeProvider>
    </MaybeConvexProvider>
  </StrictMode>,
)
