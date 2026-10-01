import { useMemo, useState } from 'react'
import { ActivityChart } from '../components/history/ActivityChart'
import { HistoryRow } from '../components/history/HistoryRow'
import { Page, PageHeader } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { FilterChip } from '../components/ui/Chip'
import { Icon3D } from '../components/ui/Icon3D'
import { Sheet } from '../components/ui/Sheet'
import { useNav } from '../hooks/useNav'
import { useQuizHistory } from '../hooks/useQuizHistory'
import { ROUTES } from '../lib/constants'
import { usePageMeta } from '../lib/seo'
import { computeStreak, dailyCounts, dayKey, dayLabel } from '../lib/streak'
import type { HistoryEntry } from '../types'

function groupByDay(entries: HistoryEntry[]): { key: string; entries: HistoryEntry[] }[] {
  const groups = new Map<string, HistoryEntry[]>()
  for (const e of entries) {
    const key = dayKey(new Date(e.dateTaken))
    const list = groups.get(key)
    if (list) list.push(e)
    else groups.set(key, [e])
  }
  return [...groups].map(([key, list]) => ({ key, entries: list }))
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-2xl font-extrabold leading-none tracking-[-0.02em] tabular-nums">{value}</dd>
    </div>
  )
}

export function HistoryPage() {
  usePageMeta({ title: 'History', description: 'Every Quiz Slayer attempt, grouped by day.', path: ROUTES.HISTORY })
  const nav = useNav()
  const { history, loading, removeEntry, clearHistory } = useQuizHistory()
  const [confirmClear, setConfirmClear] = useState(false)
  const [filter, setFilter] = useState('all')

  const subjects = useMemo(() => [...new Set(history.map((e) => e.subject))].sort(), [history])
  const filtered = filter === 'all' ? history : history.filter((e) => e.subject === filter)
  const groups = useMemo(() => groupByDay(filtered), [filtered])
  const avg = history.length ? Math.round(history.reduce((sum, e) => sum + e.score, 0) / history.length) : 0
  const streak = useMemo(() => computeStreak(history), [history])
  const days = useMemo(() => dailyCounts(history, 14), [history])

  return (
    <Page>
      <PageHeader
        title="History"
        subtitle="Your attempts, newest first."
        action={
          history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>Clear all</Button>
          )
        }
      />

      {loading ? null : history.length === 0 ? (
        <div className="card mx-auto flex max-w-[560px] flex-col items-center px-6 py-14 text-center animate-fade-up">
          <Icon3D name="notebook" size={104} eager shadow />
          <p className="mt-4 text-lg font-bold">No attempts yet</p>
          <p className="mt-1 text-sm text-muted">Finish a quiz and it will show up here.</p>
          <Button className="mt-5" onClick={() => nav(ROUTES.HOME)}>Pick a subject</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <aside className="space-y-4 lg:sticky lg:top-10 lg:col-start-2 lg:row-start-1 lg:self-start" aria-label="Summary">
            <section className="card rise p-5">
              <dl className="grid grid-cols-3 gap-3">
                <SummaryStat label="Attempts" value={history.length} />
                <SummaryStat label="Avg score" value={`${avg}%`} />
                <SummaryStat label="Streak" value={`${streak}d`} />
              </dl>
              <div className="mt-5 border-t border-line pt-4">
                <ActivityChart days={days} />
              </div>
            </section>

            {subjects.length > 1 && (
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0" role="toolbar" aria-label="Filter by subject">
                <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
                {subjects.map((s) => (
                  <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</FilterChip>
                ))}
              </div>
            )}
          </aside>

          <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
            {groups.map((group) => (
              <section key={group.key} aria-label={dayLabel(group.key)}>
                <h2 className="glass sticky top-[68px] z-10 mb-2.5 flex w-fit items-center gap-2 rounded-full border border-line py-1.5 pr-3 pl-3.5 shadow-[var(--hl)] md:top-[76px] lg:top-4">
                  <span className="eyebrow text-fg">{dayLabel(group.key)}</span>
                  <span className="font-mono text-xs text-muted">{group.entries.length}</span>
                </h2>
                <ul className="space-y-2">
                  {group.entries.map((entry, i) => (
                    <HistoryRow key={entry.id} entry={entry} index={i} onDelete={(id) => void removeEntry(id)} />
                  ))}
                </ul>
              </section>
            ))}
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">No attempts for this subject.</p>}
          </div>
        </div>
      )}

      <Sheet
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all history?"
        description="This deletes every attempt on this device, including streaks and mistake tracking. It can't be undone."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmClear(false)} data-autofocus>Cancel</Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                void clearHistory()
                setConfirmClear(false)
              }}
            >
              Clear all
            </Button>
          </div>
        }
      >
        <div className="flex justify-center py-2">
          <Icon3D name="file-text" size={80} eager />
        </div>
      </Sheet>
    </Page>
  )
}
