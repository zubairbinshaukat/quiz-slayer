import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'
import { MaybeConvexProvider } from './components/providers/MaybeConvexProvider'
import { ThemeProvider } from './context/ThemeContext'
import './styles/index.css'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <MaybeConvexProvider>
      <ReactLenis root>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </ReactLenis>
    </MaybeConvexProvider>
  </StrictMode>,
)
