import { useMemo, useState, type CSSProperties } from 'react'
import { formatPoints } from '../../lib/ranking'
import { cn } from '../../lib/utils'
import { Avatar } from '../leaderboard/Avatar'
import { FilterChip, Pill } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import { Segmented } from '../ui/Segmented'
import { StatStrip } from '../ui/StatStrip'
import { timeAgo } from './format'
import { PlayerSheet, type PlayerSummary } from './PlayerSheet'

type Sort = 'rank' | 'recent' | 'new'
type Filter = 'all' | 'chosen' | 'random' | 'idle'

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

/** Every player on the server: totals, search, sort, filter; tap one for the full picture. */
export function PlayersPanel({ token, players }: { token: string; players: PlayerSummary[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('rank')
  const [filter, setFilter] = useState<Filter>('all')
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
        <Segmented
          label="Sort players"
          value={sort}
          onChange={setSort}
          className="md:w-[300px]"
          options={[
            { value: 'rank', label: 'Rank' },
            { value: 'recent', label: 'Active' },
            { value: 'new', label: 'Newest' },
          ]}
        />
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
      ) : (
        <ul className="mt-2 space-y-2">
          {shown.map((p, i) => <PlayerRow key={p.id} p={p} index={i} onOpen={() => setOpenId(p.id)} />)}
        </ul>
      )}

      <PlayerSheet token={token} player={open} onClose={() => setOpenId(null)} />
    </div>
  )
}
