import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { Page, PageHeader } from '../components/layout/Page'
import { PlayersPanel } from '../components/stats/PlayersPanel'
import { SplitTable, type SplitGroup } from '../components/stats/SplitTable'
import { VisitsChart, type DayPoint } from '../components/stats/VisitsChart'
import { Button } from '../components/ui/Button'
import { Segmented } from '../components/ui/Segmented'
import { StatStrip } from '../components/ui/StatStrip'
import { useNav } from '../hooks/useNav'
import { clearAdminToken, useAdminToken } from '../lib/admin'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { usePageMeta } from '../lib/seo'
import { NotFoundPage } from './NotFoundPage'

type Stats = NonNullable<FunctionReturnType<typeof api.admin.stats>>
type Day = Stats['days'][number]

const CHART_DAYS = 30

/** The last `n` UTC days ending today, missing days filled with zeros. */
function lastDays(days: Day[], n: number): DayPoint[] {
  const byDay = new Map(days.map((d) => [d.day, d]))
  const out: DayPoint[] = []
  const today = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(today - i * 86_400_000).toISOString().slice(0, 10)
    const row = byDay.get(day)
    out.push({ day, visits: row?.visits ?? 0, uniques: row?.uniques ?? 0 })
  }
  return out
}

function splits(days: Day[]): SplitGroup[] {
  const sum = (k: keyof Omit<Day, 'day'>) => days.reduce((s, d) => s + d[k], 0)
  return [
    { title: 'Device', rows: [{ label: 'Mobile', value: sum('mobile') }, { label: 'Tablet', value: sum('tablet') }, { label: 'Desktop', value: sum('desktop') }] },
    {
      title: 'OS',
      rows: [
        { label: 'Android', value: sum('android') },
        { label: 'iOS', value: sum('ios') },
        { label: 'Windows', value: sum('windows') },
        { label: 'macOS', value: sum('mac') },
        { label: 'Linux', value: sum('linux') },
        { label: 'Other', value: sum('otherOs') },
      ],
    },
    {
      title: 'Browser',
      rows: [
        { label: 'Chrome', value: sum('chrome') },
        { label: 'Safari', value: sum('safari') },
        { label: 'Edge', value: sum('edge') },
        { label: 'Firefox', value: sum('firefox') },
        { label: 'Other', value: sum('otherBrowser') },
      ],
    },
  ]
}

function TrafficPanel({ data }: { data: Stats }) {
  const recent = useMemo(() => data.days.slice(-CHART_DAYS), [data])
  const chart = useMemo(() => lastDays(recent, CHART_DAYS), [recent])
  const split = useMemo(() => splits(recent), [recent])
  const t = data.totals

  return (
    <div>
      <StatStrip
        stats={[
          { label: 'Visits', value: t.visits ?? 0 },
          { label: 'Daily uniques', value: t.uniques ?? 0 },
          { label: 'New devices', value: t.newDevices ?? 0 },
        ]}
      />
      <StatStrip
        className="mt-3"
        stats={[
          { label: 'iOS installs', value: t.installs_ios ?? 0 },
          { label: 'Android installs', value: t.installs_android ?? 0 },
          { label: 'Desktop installs', value: t.installs_desktop ?? 0 },
        ]}
      />

      <div className="mt-5">
        <VisitsChart points={chart} />
      </div>

      <div className="mt-5">
        <SplitTable caption={`Devices · last ${CHART_DAYS} days`} note="Each device counted once per day it visited" groups={split} />
      </div>

      <p className="mt-4 text-xs text-muted">
        Anonymous counts · {data.dayCount} day{data.dayCount === 1 ? '' : 's'} recorded.
        Installed-app sessions: {t.installedSessions ?? 0}. Totals are all-time.
      </p>
    </div>
  )
}

type Tab = 'players' | 'traffic'

function StatsView({ token }: { token: string }) {
  const nav = useNav()
  const [tab, setTab] = useState<Tab>('players')
  const data = useQuery(api.admin.stats, { token })
  const players = useQuery(api.admin.players, { token })
  // Must agree with NotFoundPage's own meta when the session is rejected
  const rejected = data === null || players === null
  usePageMeta(rejected ? { title: 'Page not found', path: '/404' } : { title: 'Stats', path: '/stats' })
  const logout = useMutation(api.admin.logout)

  // Expired or revoked session: forget it (the page renders NotFound)
  useEffect(() => {
    if (rejected) clearAdminToken()
  }, [rejected])

  if (rejected) return <NotFoundPage />
  if (data === undefined || players === undefined) {
    return (
      <Page>
        <div className="h-8 w-40 animate-pulse rounded-btn bg-surface-2" />
        <div className="mt-5 h-48 animate-pulse rounded-card bg-surface-2" />
      </Page>
    )
  }

  async function signOut() {
    await logout({ token }).catch(() => {})
    clearAdminToken()
    nav(ROUTES.HOME, { replace: true })
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Owner"
        title="Stats"
        subtitle="Live from the server. Updates as players finish quizzes."
        action={<Button variant="ghost" size="sm" onClick={() => void signOut()}>Sign out</Button>}
      />

      <Segmented
        label="Stats view"
        value={tab}
        onChange={setTab}
        className="mb-5 md:max-w-[360px]"
        options={[
          { value: 'players', label: `Players · ${players.length}` },
          { value: 'traffic', label: 'Traffic' },
        ]}
      />

      {tab === 'players' ? <PlayersPanel token={token} players={players} /> : <TrafficPanel data={data} />}
    </Page>
  )
}

/** Hidden owner page. Without a valid session it is indistinguishable from an unknown route. */
export function StatsPage() {
  // Reactive: signing in from this very page (the 404's secret gesture) swaps in the stats
  const token = useAdminToken()
  if (!convexEnabled || !token) return <NotFoundPage />
  return <StatsView token={token} />
}
