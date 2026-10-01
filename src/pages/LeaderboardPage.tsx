import { useEffect, useState } from 'react'
import { LeaderRow } from '../components/leaderboard/LeaderRow'
import { MeBar } from '../components/leaderboard/MeBar'
import { NameCard } from '../components/leaderboard/NameCard'
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

/** "Keep random name" hides the inline name card for the rest of this browser session only. */
function keptThisSession(): boolean {
  try {
    return sessionStorage.getItem(NAME_PROMPTED_KEY) === '1'
  } catch {
    return false
  }
}

function keepForSession(): void {
  try {
    sessionStorage.setItem(NAME_PROMPTED_KEY, '1')
  } catch { /* ignore */ }
}

function LiveChip() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-bold text-success">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
        <span className="relative size-2 rounded-full bg-success" />
      </span>
      Live
    </span>
  )
}

function OfflineState() {
  return (
    <div className="card flex flex-col items-center px-5 py-14 text-center" role="status">
      <span className="flex size-16 items-center justify-center rounded-full border border-line bg-surface-2 text-muted" aria-hidden="true">
        <Icon name="wifiOff" size={28} />
      </span>
      <h2 className="mt-4 text-lg font-bold">Leaderboard needs a connection</h2>
      <p className="mt-1.5 max-w-[36ch] text-sm text-muted">
        Your quizzes still count: they're saved on this device and sent when you're back online.
      </p>
    </div>
  )
}

export function LeaderboardPage() {
  usePageMeta({
    title: 'Leaderboard',
    description: 'Top Quiz Slayer players by points: correct answers minus a penalty for wrong ones.',
    path: ROUTES.LEADERBOARD,
  })
  const { enabled, loading, unavailable, top, me, player, setName, ensurePlayer } = useLeaderboard()
  // Sheet = opened from the "Choose name" button; the inline card shows on every visit until a name is chosen
  const [sheetOpen, setSheetOpen] = useState(false)
  const [kept, setKept] = useState(keptThisSession)
  const showNameCard = !unavailable && !loading && !!player && !player.nameChosen && !kept

  useEffect(() => {
    ensurePlayer()
  }, [ensurePlayer])

  async function handleNameDone(name: string | null) {
    if (name) await setName(name) // throws a user-facing message; NameSheet shows it and stays open
    setSheetOpen(false)
  }

  const rest = top.filter((r) => r.rank > 3)
  const live = enabled && !loading && !unavailable

  return (
    <Page>
      <PageHeader
        title="Leaderboard"
        subtitle={<>Points = first-time correct − wrong ÷ (options − 1). Answer {MIN_ANSWERED_FOR_BOARD}+ questions to rank.</>}
        action={live && <LiveChip />}
      />

      {!enabled && (
        <p className="card mb-6 flex items-start gap-3 p-3.5 text-sm text-muted" role="note">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-info" />
          The global board isn't connected yet — you're seeing your own stats from this device.
        </p>
      )}

      {showNameCard && player && (
        <div className="mb-6 lg:max-w-[60%]">
          <NameCard
            player={player}
            onChoose={setName}
            onKeep={() => {
              keepForSession()
              setKept(true)
            }}
          />
        </div>
      )}

      {unavailable ? (
        <OfflineState />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:gap-10">
          <div className="min-w-0 space-y-4">
            {player && <PlayerNameRow player={player} onEdit={() => setSheetOpen(true)} />}
            <section className="card relative overflow-hidden px-4 pt-8 pb-0 sm:px-8" aria-label="Podium">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_260px_at_50%_30%,rgb(245_183_58/0.14),transparent_70%)]"
              />
              {loading ? (
                <div className="flex h-[300px] items-end justify-center gap-4" aria-busy="true" aria-label="Loading podium">
                  {[120, 160, 100].map((h) => (
                    <span key={h} className="w-1/4 animate-pulse rounded-t-md bg-surface-2" style={{ height: h }} />
                  ))}
                </div>
              ) : (
                <div className="podium-stage relative">
                  <Podium rows={top.slice(0, 3)} meId={me?.id} />
                </div>
              )}
            </section>
          </div>

          {!loading && (
            <div className="min-w-0 max-md:pb-[calc(var(--tabbar-height)+72px)]">
              <h2 className="eyebrow mb-3">Rankings</h2>
              {rest.length > 0 ? (
                <ol className="space-y-2" aria-label="Rankings">
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
                      meRow={row.id === me?.id}
                      className="cv-row"
                    />
                  ))}
                </ol>
              ) : (
                <p className="card px-4 py-6 text-center text-sm text-muted">
                  {top.length === 0
                    ? `Nobody's on the board yet. Answer ${MIN_ANSWERED_FOR_BOARD} questions to claim #1.`
                    : 'Only the podium so far. Places 4 and up are wide open.'}
                </p>
              )}
              <MeBar me={me} player={player} />
            </div>
          )}
        </div>
      )}

      {player && <NameSheet open={sheetOpen} player={player} onDone={handleNameDone} />}
    </Page>
  )
}
