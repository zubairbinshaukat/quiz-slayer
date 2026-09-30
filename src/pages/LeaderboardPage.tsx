import { useEffect, useState } from 'react'
import { LeaderRow } from '../components/leaderboard/LeaderRow'
import { MeBar } from '../components/leaderboard/MeBar'
import { NameSheet } from '../components/leaderboard/NameSheet'
import { Podium } from '../components/leaderboard/Podium'
import { Page, PageHeader } from '../components/layout/Page'
import { Icon } from '../components/ui/Icon'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { ROUTES } from '../lib/constants'
import { MIN_ANSWERED_FOR_BOARD } from '../lib/ranking'
import { usePageMeta } from '../lib/seo'

const NAME_PROMPTED_KEY = 'qs-name-prompted'

function wasPrompted(): boolean {
  try {
    return localStorage.getItem(NAME_PROMPTED_KEY) === '1'
  } catch {
    return true
  }
}

export function LeaderboardPage() {
  usePageMeta({
    title: 'Leaderboard',
    description: 'Top Quiz Slayer players by points: correct answers minus a penalty for wrong ones.',
    path: ROUTES.LEADERBOARD,
  })
  const { enabled, loading, top, me, player, setName, ensurePlayer } = useLeaderboard()
  const [namePromptOpen, setNamePromptOpen] = useState(() => !wasPrompted())

  useEffect(() => {
    ensurePlayer()
  }, [ensurePlayer])

  async function handleNameDone(name: string | null) {
    if (name) await setName(name)
    try {
      localStorage.setItem(NAME_PROMPTED_KEY, '1')
    } catch { /* ignore */ }
    setNamePromptOpen(false)
  }

  const rest = top.filter((r) => r.rank > 3)

  return (
    <Page wide>
      <PageHeader
        title="Leaderboard"
        subtitle={`Points = correct − wrong ÷ (options − 1). Answer ${MIN_ANSWERED_FOR_BOARD}+ questions to rank.`}
      />

      {!enabled && (
        <p className="card mb-6 flex items-start gap-3 p-3.5 text-sm text-muted" role="note">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-info" />
          The global board isn't connected yet — you're seeing your own stats from this device.
        </p>
      )}

      {!loading && (
        <>
          <Podium rows={top.slice(0, 3)} meId={me?.deviceId} />

          {top.length === 0 && (
            <p className="mt-6 text-center text-sm text-muted">
              Nobody's on the board yet. Answer {MIN_ANSWERED_FOR_BOARD} questions to claim #1.
            </p>
          )}

          {rest.length > 0 && (
            <ol className="mt-6 space-y-2" aria-label="Rankings">
              {rest.map((row, i) => (
                <LeaderRow
                  key={row.deviceId}
                  index={i}
                  rank={row.rank}
                  name={row.name}
                  points={row.points}
                  correct={row.correct}
                  answered={row.answered}
                  accuracy={row.accuracy}
                  highlight={row.deviceId === me?.deviceId}
                />
              ))}
            </ol>
          )}

          <MeBar me={me} player={player} />
        </>
      )}

      <NameSheet open={namePromptOpen} onDone={handleNameDone} />
    </Page>
  )
}
