import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './App'
import { primeHistory } from './hooks/useQuizHistory'
import { ErrorPage } from './pages/ErrorPage'

// Route-level code splitting via the data router's `lazy` (needed for viewTransition support)
const landing = async () => ({ Component: (await import('./pages/LandingPage')).LandingPage })

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    // Chunk-load failures (stale deploy) reload once; other errors get a styled screen
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <div className="min-h-dvh bg-bg" />,
    children: [
      // History-driven pages read IndexedDB in their loader, in parallel with the chunk download
      { index: true, loader: primeHistory, lazy: landing },
      { path: 'quiz/:slug', lazy: async () => ({ Component: (await import('./pages/QuizPage')).QuizPage }) },
      { path: 'analytics', lazy: async () => ({ Component: (await import('./pages/AnalyticsPage')).AnalyticsPage }) },
      { path: 'history', loader: primeHistory, lazy: async () => ({ Component: (await import('./pages/HistoryPage')).HistoryPage }) },
      { path: 'leaderboard', lazy: async () => ({ Component: (await import('./pages/LeaderboardPage')).LeaderboardPage }) },
      { path: 'upload', lazy: async () => ({ Component: (await import('./pages/UploadPage')).UploadPage }) },
      { path: 'link', lazy: async () => ({ Component: (await import('./pages/LinkPage')).LinkPage }) },
      // Owner-only; renders NotFound without a valid session token
      { path: 'stats', lazy: async () => ({ Component: (await import('./pages/StatsPage')).StatsPage }) },
      { path: '*', lazy: async () => ({ Component: (await import('./pages/NotFoundPage')).NotFoundPage }) },
    ],
  },
])
