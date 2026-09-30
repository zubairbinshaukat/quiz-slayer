import { useEffect, useState } from 'react'
import { QuestionReview } from '../components/analytics/QuestionReview'
import { ScoreHero } from '../components/analytics/ScoreHero'
import { ShareCard } from '../components/analytics/ShareCard'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Confetti } from '../components/ui/Confetti'
import { Icon } from '../components/ui/Icon'
import { StatStrip } from '../components/ui/StatStrip'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { readAnalyticsSnapshot } from '../lib/analyticsSnapshot'
import { ROUTES } from '../lib/constants'
import { computePoints, formatPoints } from '../lib/ranking'
import { getOptionsCount, getWrongQuestions } from '../lib/quizStats'
import { usePageMeta } from '../lib/seo'
import { formatClock } from '../lib/utils'
import type { AnalyticsSnapshot } from '../types'

export function AnalyticsPage() {
  usePageMeta({ title: 'Results', path: ROUTES.ANALYTICS })
  const nav = useNav()
  const { status, subject, slug, mode, questions, answers, result, resetQuiz, startRetry } = useQuiz()

  // Prefer live context data; fall back to sessionStorage for refresh / back-navigation.
  // Frozen at mount so starting a retry (which clears both) can't blank the page mid-navigation.
  const [data] = useState<AnalyticsSnapshot | null>(() => {
    if (status === 'completed' && result) {
      return { result, subject: subject ?? '', slug: slug ?? undefined, mode, questions, answers }
    }
    return readAnalyticsSnapshot()
  })

  useEffect(() => {
    if (!data) nav(ROUTES.HOME, { replace: true })
  }, [data, nav])

  if (!data) return null

  const { result: r, questions: qs, answers: ans } = data
  const wrongCount = getWrongQuestions(qs, ans).length
  const answered = ans.filter((a) => a !== null).length
  const points = computePoints(r.correct, answered - r.correct, getOptionsCount(qs) || 4)
  const cleared = data.mode === 'retry' && wrongCount === 0

  function handleRetryWrong() {
    const started = startRetry()
    if (started > 0 && data?.slug) nav(ROUTES.QUIZ_PATH(data.slug))
  }

  function handleTryAnother() {
    resetQuiz()
    nav(ROUTES.HOME)
  }

  return (
    <Page>
      {cleared && <Confetti />}
      <h1 className="sr-only">Quiz results</h1>

      <ScoreHero
        score={r.score}
        subject={data.subject}
        eyebrow={data.mode === 'retry' ? 'Retry round' : data.mode === 'exam' ? 'Mock exam' : 'Quiz complete'}
        headline={cleared ? 'Cleared!' : undefined}
      />

      <StatStrip
        className="mt-3"
        stats={[
          { label: 'Correct', value: r.correct, tone: 'text-success' },
          { label: 'Wrong', value: wrongCount, tone: wrongCount > 0 ? 'text-danger' : undefined },
          { label: 'Time', value: <span className="font-mono text-lg">{formatClock(r.timeTaken)}</span> },
          { label: 'Points', value: formatPoints(points), tone: 'text-accent-fg' },
        ]}
      />

      <div className="mt-4 flex flex-col gap-3">
        {wrongCount > 0 && data.slug && (
          <Button size="lg" className="w-full" onClick={handleRetryWrong}>
            <Icon name="refresh" size={18} />
            Retry wrong answers ({wrongCount})
          </Button>
        )}
        {cleared && (
          <p className="card flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-success" role="status">
            <Icon name="check" size={18} strokeWidth={3} />
            Every mistake cleared. Nice.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => nav(ROUTES.HOME)}>
            <Icon name="home" size={18} />
            Home
          </Button>
          <ShareCard subject={data.subject} score={r.score} correct={r.correct} total={r.total} points={points} timeTaken={r.timeTaken} />
        </div>
        <Button variant={wrongCount > 0 && data.slug ? 'ghost' : 'primary'} className="w-full" onClick={handleTryAnother}>
          Try another subject
        </Button>
      </div>

      <div className="mt-8">
        <QuestionReview questions={qs} answers={ans} />
      </div>
    </Page>
  )
}
