import { useMemo, useState, type CSSProperties } from 'react'
import { formatPoints } from '../../lib/ranking'
import { lsGet, lsSet } from '../../lib/storage'
import { STATS_PLAYERS_VIEW_KEY } from '../../lib/storageKeys'
import { cn } from '../../lib/utils'
import { Avatar } from '../leaderboard/Avatar'
import { FilterChip, Pill } from '../ui/Chip'
import { Icon, type IconName } from '../ui/Icon'
import { Segmented } from '../ui/Segmented'
import { StatStrip } from '../ui/StatStrip'
import { timeAgo } from './format'
import { PlayerSheet, type PlayerSummary } from './PlayerSheet'

type Sort = 'rank' | 'recent' | 'new'
type Filter = 'all' | 'chosen' | 'random' | 'idle'
type View = 'list' | 'grid'

const WEEK_MS = 7 * 86_400_000

const SORTS: Record<Sort, (a: PlayerSummary, b: PlayerSummary) => number> = {
  // Ranked players by rank, then everyone else by points
  rank: (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || b.points - a.points || b.answered - a.answered,
  recent: (a, b) => (b.lastActiveAt ?? 0) - (a.lastActiveAt ?? 0),
  new: (a, b) => b.createdAt - a.createdAt,
}

const FILTERS: Record<Filter, { label: string; test: (p: PlayerSummary) => boolean }> = {
  all: { label: 'All', test: () => true },
  chosen: { label: 'Chose a name', test: (p) => p.nameChosen },
  random: { label: 'Random name', test: (p) => !p.nameChosen },
  idle: { label: 'No quizzes', test: (p) => p.attempts === 0 },
}

function PlayerRow({ p, index, onOpen }: { p: PlayerSummary; index: number; onOpen: () => void }) {
  return (
    <li className="rise cv-row" style={{ '--i': Math.min(index, 10) } as CSSProperties}>
      <button
        type="button"
        onClick={onOpen}
        className="card press flex min-h-16 w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-surface-3"
      >
        <span className={cn('w-9 shrink-0 text-center font-mono text-sm font-bold', p.rank && p.rank <= 3 ? 'text-accent' : 'text-muted')}>
          {p.rank ? `#${p.rank}` : '—'}
        </span>
        <Avatar name={p.name} size={38} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold">{p.name}</span>
            {p.nameChosen && <Pill className="shrink-0 bg-accent/15 py-0 text-[11px] text-accent">Named</Pill>}
          </span>
          <span className="mt-0.5 block truncate font-mono text-xs text-muted">
            {p.answered > 0 ? `${p.correct}/${p.answered} · ${Math.round(p.accuracy)}%` : 'no ranked answers'}
            {` · ${p.attempts} quiz${p.attempts === 1 ? '' : 'zes'}`}
            {p.deviceCount > 1 && ` · ${p.deviceCount} devices`}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-mono text-base font-bold">{formatPoints(p.points)}</span>
          <span className="block text-[11px] text-muted">{timeAgo(p.lastActiveAt)}</span>
        </span>
        <Icon name="forward" size={16} className="-mr-1 shrink-0 text-muted" />
      </button>
    </li>
  )
}

function PlayerCard({ p, index, onOpen }: { p: PlayerSummary; index: number; onOpen: () => void }) {
  return (
    <li className="rise cv-row" style={{ '--i': Math.min(index, 12) } as CSSProperties}>
      <button
        type="button"
        onClick={onOpen}
        className="card press flex h-full w-full flex-col p-3.5 text-left transition-colors duration-150 hover:bg-surface-3"
      >
        <span className="flex items-start justify-between gap-2">
          <Avatar name={p.name} size={44} />
          <span className={cn('font-mono text-sm font-bold', p.rank && p.rank <= 3 ? 'text-accent' : 'text-muted')}>
            {p.rank ? `#${p.rank}` : '—'}
          </span>
        </span>
        <span className="mt-3 truncate text-[15px] font-semibold">{p.name}</span>
        <span className="mt-1 flex h-5 items-center">
          {p.nameChosen && <Pill className="bg-accent/15 py-0 text-[11px] text-accent">Named</Pill>}
        </span>
        <span className="mt-auto pt-3">
          <span className="block font-mono text-2xl font-bold leading-none">{formatPoints(p.points)}</span>
          <span className="mt-0.5 block text-[11px] text-muted">points</span>
        </span>
        <span className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-2.5 font-mono text-xs">
          <span>
            <span className="block text-fg">{p.answered > 0 ? `${Math.round(p.accuracy)}%` : '—'}</span>
            <span className="block font-sans text-[11px] text-muted">{p.answered > 0 ? `${p.correct}/${p.answered}` : 'no answers'}</span>
          </span>
          <span>
            <span className="block text-fg">{p.attempts}</span>
            <span className="block font-sans text-[11px] text-muted">quiz{p.attempts === 1 ? '' : 'zes'}</span>
          </span>
        </span>
        <span className="mt-2 truncate text-[11px] text-muted">
          {timeAgo(p.lastActiveAt)}
          {p.deviceCount > 1 && ` · ${p.deviceCount} devices`}
        </span>
      </button>
    </li>
  )
}

const VIEWS: { value: View; label: string; icon: IconName }[] = [
  { value: 'list', label: 'List view', icon: 'list' },
  { value: 'grid', label: 'Grid view', icon: 'grid' },
]

function ViewToggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  return (
    <div role="radiogroup" aria-label="Players layout" className="flex shrink-0 gap-1 rounded-full border border-line bg-surface-2 p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]">
      {VIEWS.map((v) => {
        const active = v.value === value
        return (
          <button
            key={v.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={v.label}
            title={v.label}
            onClick={() => onChange(v.value)}
            className={cn(
              'press grid size-10 place-items-center rounded-full',
              active ? 'bg-accent text-accent-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_2px_8px_-2px_rgb(0_0_0/0.4)]' : 'text-muted hover:bg-surface-3 hover:text-fg',
            )}
          >
            <Icon name={v.icon} size={18} />
          </button>
        )
      })}
    </div>
  )
}

/** Every player on the server: totals, search, sort, filter; tap one for the full picture. */
export function PlayersPanel({ token, players }: { token: string; players: PlayerSummary[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('rank')
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>(() => (lsGet(STATS_PLAYERS_VIEW_KEY) === 'grid' ? 'grid' : 'list'))

  function changeView(v: View) {
    lsSet(STATS_PLAYERS_VIEW_KEY, v)
    setView(v)
  }
  const [openId, setOpenId] = useState<string | null>(null)
  const [now] = useState(() => Date.now())

  const totals = useMemo(() => {
    let answered = 0
    let correct = 0
    let attempts = 0
    for (const p of players) {
      answered += p.answered
      correct += p.correct
      attempts += p.attempts
    }
    return {
      players: players.length,
      named: players.filter((p) => p.nameChosen).length,
      active: players.filter((p) => p.lastActiveAt && now - p.lastActiveAt < WEEK_MS).length,
      ranked: players.filter((p) => p.rank !== null).length,
      answered,
      attempts,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    }
  }, [players, now])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return players
      .filter((p) => FILTERS[filter].test(p) && (!q || p.name.toLowerCase().includes(q)))
      .sort(SORTS[sort])
  }, [players, query, sort, filter])

  // Looked up live so the open sheet follows server updates
  const open = openId ? players.find((p) => p.id === openId) ?? null : null

  return (
    <div>
      <StatStrip
        stats={[
          { label: 'Players', value: totals.players },
          { label: 'Named', value: totals.named },
          { label: 'Active 7d', value: totals.active },
          { label: 'On board', value: totals.ranked },
        ]}
      />
      <StatStrip
        className="mt-3"
        stats={[
          { label: 'Quizzes', value: totals.attempts },
          { label: 'Answers', value: totals.answered },
          { label: 'Accuracy', value: `${totals.accuracy}%` },
        ]}
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search players</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            autoComplete="off"
            enterKeyHint="search"
            className="min-h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none md:text-sm"
          />
        </label>
        <div className="flex gap-2">
          <Segmented
            label="Sort players"
            value={sort}
            onChange={setSort}
            className="min-w-0 flex-1 md:w-75 md:flex-none"
            options={[
              { value: 'rank', label: 'Rank' },
              { value: 'recent', label: 'Active' },
              { value: 'new', label: 'Newest' },
            ]}
          />
          <ViewToggle value={view} onChange={changeView} />
        </div>
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="group" aria-label="Filter players">
        {(Object.keys(FILTERS) as Filter[]).map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {FILTERS[f].label}
          </FilterChip>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted" aria-live="polite">
        {shown.length === players.length ? `${players.length} players` : `${shown.length} of ${players.length} players`} · names shown exactly as on the board
      </p>
      {shown.length === 0 ? (
        <div className="card mt-2 p-6 text-center text-sm text-muted">
          {players.length === 0 ? 'No players yet. They appear after their first finished quiz or leaderboard visit.' : 'No players match.'}
        </div>
      ) : view === 'grid' ? (
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((p, i) => <PlayerCard key={p.id} p={p} index={i} onOpen={() => setOpenId(p.id)} />)}
        </ul>
      ) : (
        <ul className="mt-2 space-y-2">
          {shown.map((p, i) => <PlayerRow key={p.id} p={p} index={i} onOpen={() => setOpenId(p.id)} />)}
        </ul>
      )}

      <PlayerSheet token={token} player={open} onClose={() => setOpenId(null)} />
    </div>
  )
}
