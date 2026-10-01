import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { PageWrapper } from './components/layout/PageWrapper'
import { QuizProvider } from './context/QuizContext'
import { SoundProvider } from './context/SoundContext'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { HistoryPage } from './pages/HistoryPage'
import { LandingPage } from './pages/LandingPage'
import { QuizPage } from './pages/QuizPage'
import { UploadPage } from './pages/UploadPage'
import { ExamPage } from './pages/ExamPage'
import { ExamResultPage } from './pages/ExamResultPage'
import { ExamFAB } from './components/exam/ExamFAB'

function AppRoutes() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <ExamFAB />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/quiz/:slug" element={<PageWrapper><QuizPage /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><AnalyticsPage /></PageWrapper>} />
          <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
          <Route path="/upload" element={<PageWrapper><UploadPage /></PageWrapper>} />
          <Route path="/exam" element={<PageWrapper><ExamPage /></PageWrapper>} />
          <Route path="/exam/result" element={<PageWrapper><ExamResultPage /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><LandingPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
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
