import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { PageWrapper } from './components/layout/PageWrapper'
import { ExamFAB } from './components/exam/ExamFAB'
import { UpdatePrompt } from './components/pwa/UpdatePrompt'
import { Spinner } from './components/ui/Spinner'
import { QuizProvider } from './context/QuizContext'
import { SoundProvider } from './context/SoundContext'

// Route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const UploadPage = lazy(() => import('./pages/UploadPage').then((m) => ({ default: m.UploadPage })))
const ExamPage = lazy(() => import('./pages/ExamPage').then((m) => ({ default: m.ExamPage })))
const ExamResultPage = lazy(() => import('./pages/ExamResultPage').then((m) => ({ default: m.ExamResultPage })))

function PageFallback() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Spinner />
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <ExamFAB />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/quiz/:slug" element={<PageWrapper><QuizPage /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><AnalyticsPage /></PageWrapper>} />
          <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
          <Route path="/upload" element={<PageWrapper><UploadPage /></PageWrapper>} />
          <Route path="/exam" element={<PageWrapper><ExamPage /></PageWrapper>} />
          <Route path="/exam/result" element={<PageWrapper><ExamResultPage /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><LandingPage /></PageWrapper>} />
        </Routes>
      </Suspense>
      <UpdatePrompt />
    </>
  )
}

export default function App() {
  return (
    <SoundProvider>
      <QuizProvider>
        <AppRoutes />
      </QuizProvider>
    </SoundProvider>
  )
}
