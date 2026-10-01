import { useEffect, useState } from 'react'
import { LeaderRow } from '../components/leaderboard/LeaderRow'
import { MeBar } from '../components/leaderboard/MeBar'
import { NameSheet } from '../components/leaderboard/NameSheet'
import { PlayerNameRow } from '../components/leaderboard/PlayerNameRow'
import { Podium } from '../components/leaderboard/Podium'
import { Page, PageHeader } from '../components/layout/Page'
import { Icon } from '../components/ui/Icon'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { ROUTES } from '../lib/constants'
import { MIN_ANSWERED_FOR_BOARD } from '../lib/ranking'
import { usePageMeta } from '../lib/seo'
import { NAME_PROMPTED_KEY } from '../lib/storageKeys'

function wasPrompted(): boolean {
  try {
    return localStorage.getItem(NAME_PROMPTED_KEY) === '1'
  } catch {
    return true
  }
}

function markPrompted(): void {
  try {
    localStorage.setItem(NAME_PROMPTED_KEY, '1')
  } catch { /* ignore */ }
}

export function LeaderboardPage() {
  usePageMeta({
    title: 'Leaderboard',
    description: 'Top Quiz Slayer players by points: correct answers minus a penalty for wrong ones.',
    path: ROUTES.LEADERBOARD,
  })
  const { enabled, loading, unavailable, top, me, player, setName, ensurePlayer } = useLeaderboard()
  // 'auto' = first-visit prompt (skipped if a name is already chosen); 'manual' = opened from the name row
  const [nameSheet, setNameSheet] = useState<'auto' | 'manual' | null>(() => (wasPrompted() ? null : 'auto'))
  const sheetOpen = !unavailable && (nameSheet === 'manual' || (nameSheet === 'auto' && !loading && !player?.nameChosen))

  useEffect(() => {
    ensurePlayer()
  }, [ensurePlayer])

  async function handleNameDone(name: string | null) {
    if (name) await setName(name) // throws a user-facing message; NameSheet shows it and stays open
    markPrompted()
    setNameSheet(null)
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

      {unavailable ? (
        <div className="card flex flex-col items-center px-5 py-10 text-center" role="status">
          <span className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-muted" aria-hidden="true">
            <Icon name="wifiOff" size={26} />
          </span>
          <h2 className="mt-4 text-lg">Leaderboard needs a connection</h2>
          <p className="mt-1.5 max-w-[34ch] text-sm text-muted">
            Your quizzes still count: they're saved on this device and sent when you're back online.
          </p>
        </div>
      ) : (
        player && <PlayerNameRow player={player} onEdit={() => setNameSheet('manual')} />
      )}

      {!loading && !unavailable && (
        <>
          <Podium rows={top.slice(0, 3)} meId={me?.id} />

          {top.length === 0 && (
            <p className="mt-6 text-center text-sm text-muted">
              Nobody's on the board yet. Answer {MIN_ANSWERED_FOR_BOARD} questions to claim #1.
            </p>
          )}

          {rest.length > 0 && (
            <ol className="mt-6 space-y-2" aria-label="Rankings">
              {rest.map((row, i) => (
                <LeaderRow
                  key={row.id}
                  index={i}
                  rank={row.rank}
                  name={row.name}
                  points={row.points}
                  correct={row.correct}
                  answered={row.answered}
                  accuracy={row.accuracy}
                  highlight={row.id === me?.id}
                  className="cv-row"
                />
              ))}
            </ol>
          )}

          <MeBar me={me} player={player} />
        </>
      )}

      {player && <NameSheet open={sheetOpen} player={player} onDone={handleNameDone} />}
    </Page>
  )
}
