import { useEffect, useState } from 'react'
import { QuestionReview } from '../components/analytics/QuestionReview'
import { ScoreHero } from '../components/analytics/ScoreHero'
import { ShareCardPreview } from '../components/analytics/ShareCard'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Confetti } from '../components/ui/Confetti'
import { Pill } from '../components/ui/Chip'
import { Icon } from '../components/ui/Icon'
import { StatTile } from '../components/ui/StatTile'
import { useNav } from '../hooks/useNav'
import { useQuiz } from '../hooks/useQuiz'
import { useShareImage } from '../hooks/useShareImage'
import { useSubjectData } from '../hooks/useSubjectData'
import { readAnalyticsSnapshot } from '../lib/analyticsSnapshot'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { EXAM_PASS_THRESHOLD } from '../lib/examState'
import { computePoints, formatPoints } from '../lib/ranking'
import { getOptionsCount, getWrongQuestions } from '../lib/quizStats'
import { usePageMeta } from '../lib/seo'
import { cn, formatClock } from '../lib/utils'
import type { AnalyticsSnapshot } from '../types'

export function AnalyticsPage() {
  usePageMeta({ title: 'Results', path: ROUTES.ANALYTICS })
  const nav = useNav()
  const { status, subject, slug, mode, questions, answers, result, resetQuiz, startRetry } = useQuiz()
  const { getSubjectBySlug } = useSubjectData()

  // Prefer live context data; fall back to sessionStorage for refresh / back-navigation.
  // Frozen at mount so starting a retry (which clears both) can't blank the page mid-navigation.
  const [data] = useState<AnalyticsSnapshot | null>(() => {
    if (status === 'completed' && result) {
      return { result, subject: subject ?? '', slug: slug ?? undefined, mode, questions, answers }
    }
    return readAnalyticsSnapshot()
  })
  const score = data?.result.score ?? 0
  const share = useShareImage({
    filename: `quiz-slayer-${score}.png`,
    text: `I scored ${score}% on ${data?.subject ?? 'a quiz'} in Quiz Slayer.`,
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
  const exam = data.mode === 'exam'
  const passed = exam && r.score >= EXAM_PASS_THRESHOLD
  const canRetry = wrongCount > 0 && !!data.slug
  // Uploaded subjects have no server answer key: their attempts are stored unranked
  const practiceOnly = convexEnabled && !!data.slug && getSubjectBySlug(data.slug)?.isCustom === true
  const shareData = { subject: data.subject, score: r.score, correct: r.correct, total: r.total, points, timeTaken: r.timeTaken }

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
      {(cleared || passed) && <Confetti />}
      <h1 className="sr-only">{exam ? 'Exam results' : 'Quiz results'}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:gap-x-10">
        <div className="min-w-0 space-y-4">
          <ScoreHero
            score={r.score}
            subject={data.subject}
            eyebrow={data.mode === 'retry' ? 'Retry round' : exam ? 'Timed exam' : 'Quiz complete'}
            headline={exam ? (passed ? 'Passed' : 'Keep going') : cleared ? 'Cleared!' : undefined}
          />

          {exam && (
            <div role="status" className={cn('card flex items-start gap-3 p-4 text-sm leading-relaxed', passed ? 'border-success/30' : 'border-line-strong')}>
              <Icon name={passed ? 'check' : 'info'} size={18} className={cn('mt-0.5 shrink-0', passed ? 'text-success' : 'text-info')} />
              <p>
                <span className="font-semibold">{passed ? 'Passed. ' : `Keep going — the pass mark is ${EXAM_PASS_THRESHOLD}%. `}</span>
                {wrongCount > 0
                  ? `${wrongCount} question${wrongCount === 1 ? '' : 's'} you missed will come back in your next timed exam${r.correct > 0 ? '; the ones you got right are mastered' : ''}.`
                  : 'Perfect score: every question in this exam is now mastered.'}
              </p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile index={1} label="Correct" value={r.correct} tone="text-success" />
            <StatTile index={2} label="Wrong" value={wrongCount} tone={wrongCount > 0 ? 'text-danger' : undefined} />
            <StatTile index={3} label="Time" value={<span className="font-mono text-[22px] sm:text-2xl">{formatClock(r.timeTaken)}</span>} />
            <StatTile
              index={4}
              label="Points"
              value={formatPoints(points)}
              footer={
                practiceOnly && (
                  <Pill className="w-fit border border-line bg-surface-2 px-2 py-0.5 text-[11px] text-muted">Practice only · not ranked</Pill>
                )
              }
            />
          </dl>

          {cleared && (
            <p className="card flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-success" role="status">
              <Icon name="check" size={18} strokeWidth={3} />
              Every mistake cleared. Nice.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {canRetry ? (
              <Button size="lg" className="w-full sm:w-auto sm:flex-[2]" onClick={handleRetryWrong}>
                <Icon name="refresh" size={18} />
                Retry wrong ({wrongCount})
              </Button>
            ) : (
              <Button size="lg" className="w-full sm:w-auto sm:flex-[2]" onClick={handleTryAnother}>
                Try another subject
                <Icon name="forward" size={18} strokeWidth={2.5} />
              </Button>
            )}
            <Button variant="outline" size="lg" className="flex-1" onClick={() => void share.share()} disabled={share.busy} aria-busy={share.busy}>
              <Icon name="share" size={18} />
              {share.busy ? 'Preparing…' : 'Share'}
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={() => nav(ROUTES.HOME)}>
              <Icon name="home" size={18} />
              Home
            </Button>
            {share.error && <p role="alert" className="basis-full text-center text-sm text-danger">{share.error}</p>}
          </div>

        </div>

        <aside className="space-y-4 lg:sticky lg:top-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start" aria-label="Share your result">
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold tracking-[-0.01em]">Share card</h2>
              <span className="eyebrow">1080 × 1080</span>
            </div>
            <ShareCardPreview data={shareData} artRef={share.ref} />
            <Button variant="secondary" className="mt-4 w-full" onClick={() => void share.share()} disabled={share.busy}>
              <Icon name="share" size={18} />
              {share.busy ? 'Preparing…' : 'Share image'}
            </Button>
          </section>
          {canRetry && (
            <Button variant="ghost" className="w-full" onClick={handleTryAnother}>
              Try another subject
            </Button>
          )}
        </aside>

        <div className="min-w-0 pt-2 lg:col-start-1 lg:pt-4">
          <QuestionReview questions={qs} answers={ans} />
        </div>
      </div>
    </Page>
  )
}
