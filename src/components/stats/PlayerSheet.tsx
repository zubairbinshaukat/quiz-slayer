import { useState, type ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../../convex/_generated/api'
import { formatPoints } from '../../lib/ranking'
import { getSubjectHue } from '../../lib/subjectUtils'
import { cn, formatClock } from '../../lib/utils'
import { Avatar } from '../leaderboard/Avatar'
import { Button } from '../ui/Button'
import { Pill } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'
import { deviceLabel, formatDate, formatDateTime, signedPoints, timeAgo } from './format'

export type PlayerSummary = NonNullable<FunctionReturnType<typeof api.admin.players>>[number]
type Detail = NonNullable<FunctionReturnType<typeof api.admin.player>>

const MODE = {
  quiz: { label: 'Practice', className: 'border border-line text-muted' },
  exam: { label: 'Exam', className: 'bg-info/12 text-info' },
  retry: { label: 'Retry', className: 'bg-danger/12 text-danger' },
} as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="eyebrow mb-2">{title}</h3>
      {children}
    </section>
  )
}

function Devices({ devices }: { devices: Detail['devices'] }) {
  if (devices.length === 0) return <p className="text-sm text-muted">No devices recorded.</p>
  return (
    <ul className="space-y-2">
      {devices.map((d, i) => (
        <li key={i} className="flex items-center gap-3 rounded-btn border border-line bg-surface-2 px-3 py-2.5 text-sm">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-3 font-mono text-xs font-bold">{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{deviceLabel(d.info) ?? 'No details yet'}</span>
            <span className="block text-xs text-muted">
              {d.info ? (d.info.installed ? 'Installed app' : 'In the browser') : 'Reports with its next finished quiz'}
              {d.lastSeenAt && ` · last quiz ${timeAgo(d.lastSeenAt)}`}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function Subjects({ subjects }: { subjects: Detail['subjects'] }) {
  if (subjects.length === 0) return <p className="text-sm text-muted">No quizzes on the server yet.</p>
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-btn border border-line">
      {subjects.map((s) => (
        <li key={s.slug} className="flex items-center gap-3 bg-surface-2 px-3 py-2.5">
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: `hsl(${getSubjectHue(s.slug)} 80% 62%)` }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{s.subject}</span>
            <span className="block font-mono text-xs text-muted">
              {s.attempts} quiz{s.attempts === 1 ? '' : 'zes'} · {s.ranked ? `${s.correct}/${s.answered} correct` : `${s.answered} answered`}
            </span>
          </span>
          {s.ranked ? (
            <span className="shrink-0 font-mono text-sm font-bold">{signedPoints(s.points)}</span>
          ) : (
            <Pill className="shrink-0 border border-line text-muted">Custom</Pill>
          )}
        </li>
      ))}
    </ul>
  )
}

function Attempts({ detail }: { detail: Detail }) {
  if (detail.attempts.length === 0) return <p className="text-sm text-muted">No quizzes on the server yet.</p>
  const multiDevice = detail.devices.length > 1
  return (
    <>
      <ul className="space-y-2">
        {detail.attempts.map((a) => (
          <li key={a.id} className="rounded-btn border border-line bg-surface-2 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{a.subject}</span>
              <span className={cn('shrink-0 font-mono text-sm font-bold', a.points > 0 ? 'text-success' : a.points < 0 ? 'text-danger' : 'text-muted')}>
                {a.ranked ? signedPoints(a.points) : '—'}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted">
              <Pill className={cn('py-0 font-sans', MODE[a.mode].className)}>{MODE[a.mode].label}</Pill>
              {!a.ranked && <Pill className="border border-line py-0 font-sans text-muted">Unranked</Pill>}
              <span>{formatDateTime(a.createdAt)}</span>
              <span>· {a.ranked ? `${a.correct}✓ ${a.wrong}✗` : `${a.answered} answered`} of {a.total}</span>
              <span>· {formatClock(a.timeTaken)}</span>
              {multiDevice && a.device !== null && <span>· device {a.device + 1}</span>}
            </div>
          </li>
        ))}
      </ul>
      {detail.attemptsShown >= detail.attemptsLimit && (
        <p className="mt-2 text-xs text-muted">Showing the latest {detail.attemptsLimit} quizzes.</p>
      )}
    </>
  )
}

function Body({ token, player }: { token: string; player: PlayerSummary }) {
  const detail = useQuery(api.admin.player, { token, playerId: player.id })
  const p = player
  const grid: [string, string, string?][] = [
    ['Points', formatPoints(p.points)],
    ['Rank', p.rank ? `#${p.rank}` : '—'],
    ['Accuracy', p.answered > 0 ? `${Math.round(p.accuracy)}%` : '—'],
    ['Correct', String(p.correct), 'text-success'],
    ['Wrong', String(p.wrong), p.wrong > 0 ? 'text-danger' : ''],
    ['Mastered', String(p.mastered)],
  ]

  return (
    <>
      <div className="flex items-center gap-3.5">
        <Avatar name={p.name} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{p.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <Pill className={p.nameChosen ? 'bg-accent/15 text-accent' : 'border border-line text-muted'}>{p.nameChosen ? 'Chose name' : 'Random name'}</Pill>
            <span>Joined {formatDate(p.createdAt)}</span>
            <span>· active {timeAgo(p.lastActiveAt)}</span>
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        {grid.map(([label, value, tone]) => (
          <div key={label} className="rounded-btn bg-surface-2 px-2 py-2.5">
            <dt className="eyebrow">{label}</dt>
            <dd className={cn('mt-0.5 font-mono text-base font-bold', tone)}>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">
        {p.answered} ranked answers over {p.attempts} quiz{p.attempts === 1 ? '' : 'zes'}
        {!p.rank && p.answered > 0 && ' · needs 20 answers to appear on the board'}. Kept on the server: clearing history on a device never changes these.
      </p>

      {detail === undefined ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-btn bg-surface-2" />)}
        </div>
      ) : detail === null ? (
        <p className="mt-6 text-sm text-muted">This player no longer exists (their device linked to another player).</p>
      ) : (
        <>
          <Section title={`Devices · ${detail.devices.length}`}><Devices devices={detail.devices} /></Section>
          <Section title="Subjects"><Subjects subjects={detail.subjects} /></Section>
          <Section title="Recent quizzes"><Attempts detail={detail} /></Section>
        </>
      )}
    </>
  )
}

/** Two taps: arm, then confirm. Deletes the player and all of their server data. */
function RemoveButton({ token, player, onRemoved }: { token: string; player: PlayerSummary; onRemoved: () => void }) {
  const remove = useMutation(api.admin.removePlayer)
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function confirm() {
    setBusy(true)
    setFailed(false)
    const res = await remove({ token, playerId: player.id }).catch(() => null)
    setBusy(false)
    if (res?.ok) onRemoved()
    else setFailed(true)
  }

  return (
    <div>
      {failed && <p role="alert" className="mb-2 text-center text-sm font-semibold text-danger">Couldn’t remove. Check your connection.</p>}
      {armed ? (
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setArmed(false)} disabled={busy}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => void confirm()} disabled={busy}>
            {busy ? 'Removing…' : `Remove ${player.name}`}
          </Button>
        </div>
      ) : (
        <Button variant="ghost" className="w-full text-danger" onClick={() => setArmed(true)}>
          <Icon name="trash" size={16} />
          Remove player and all their points
        </Button>
      )}
    </div>
  )
}

/** Everything the server knows about one player. */
export function PlayerSheet({ token, player, onClose }: { token: string; player: PlayerSummary | null; onClose: () => void }) {
  return (
    <Sheet
      open={!!player}
      onClose={onClose}
      title="Player"
      className="md:max-w-[560px]"
      footer={player && <RemoveButton key={player.id} token={token} player={player} onRemoved={onClose} />}
    >
      {player && <Body key={player.id} token={token} player={player} />}
    </Sheet>
  )
}
