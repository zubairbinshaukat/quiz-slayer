import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './App'

// Route-level code splitting via the data router's `lazy` (needed for viewTransition support)
const landing = async () => ({ Component: (await import('./pages/LandingPage')).LandingPage })

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    hydrateFallbackElement: <div className="min-h-dvh bg-bg" />,
    children: [
      { index: true, lazy: landing },
      { path: 'quiz/:slug', lazy: async () => ({ Component: (await import('./pages/QuizPage')).QuizPage }) },
      { path: 'analytics', lazy: async () => ({ Component: (await import('./pages/AnalyticsPage')).AnalyticsPage }) },
      { path: 'history', lazy: async () => ({ Component: (await import('./pages/HistoryPage')).HistoryPage }) },
      { path: 'leaderboard', lazy: async () => ({ Component: (await import('./pages/LeaderboardPage')).LeaderboardPage }) },
      { path: 'upload', lazy: async () => ({ Component: (await import('./pages/UploadPage')).UploadPage }) },
      { path: 'link', lazy: async () => ({ Component: (await import('./pages/LinkPage')).LinkPage }) },
      // Owner-only; renders NotFound without a valid session token
      { path: 'stats', lazy: async () => ({ Component: (await import('./pages/StatsPage')).StatsPage }) },
      { path: '*', lazy: async () => ({ Component: (await import('./pages/NotFoundPage')).NotFoundPage }) },
    ],
  },
])
