import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { Page, PageHeader } from '../components/layout/Page'
import { SplitTable, type SplitGroup } from '../components/stats/SplitTable'
import { VisitsChart, type DayPoint } from '../components/stats/VisitsChart'
import { Button } from '../components/ui/Button'
import { StatStrip } from '../components/ui/StatStrip'
import { Switch } from '../components/ui/Switch'
import { useNav } from '../hooks/useNav'
import { clearAdminToken, useAdminToken } from '../lib/admin'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { DEMO_LEADERBOARD_DEFAULT } from '../lib/leaderboardDemo'
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

/** Owner switch for the fake leaderboard (everyone sees the change live). */
function DemoBoardSwitch({ token }: { token: string }) {
  const setting = useQuery(api.settings.get)
  const setDemo = useMutation(api.admin.setDemoLeaderboard)
  const [error, setError] = useState(false)
  const on = setting?.demoLeaderboard ?? DEMO_LEADERBOARD_DEFAULT

  async function toggle(next: boolean) {
    setError(false)
    const res = await setDemo({ token, on: next }).catch(() => null)
    if (!res?.ok) setError(true)
  }

  return (
    <section className="card mt-5 flex items-center gap-4 p-4" aria-labelledby="demo-board-heading">
      <div className="min-w-0 flex-1">
        <h2 id="demo-board-heading" className="text-base">Demo leaderboard</h2>
        <p className="mt-0.5 text-sm text-muted">
          {on ? 'Showing fake players to everyone. Turn off to show the real board.' : 'Off: everyone sees the real board.'}
        </p>
        {error && <p className="mt-1 text-sm font-semibold text-danger">Couldn’t save. Check your connection.</p>}
      </div>
      <Switch checked={on} onChange={(next) => void toggle(next)} label="Demo leaderboard" disabled={setting === undefined} />
    </section>
  )
}

function StatsView({ token }: { token: string }) {
  const nav = useNav()
  const data = useQuery(api.admin.stats, { token })
  // Must agree with NotFoundPage's own meta when the session is rejected
  usePageMeta(data === null ? { title: 'Page not found', path: '/404' } : { title: 'Stats', path: '/stats' })
  const logout = useMutation(api.admin.logout)

  // Expired or revoked session: forget it (the page renders NotFound)
  useEffect(() => {
    if (data === null) clearAdminToken()
  }, [data])

  const recent = useMemo(() => (data ? data.days.slice(-CHART_DAYS) : []), [data])
  const chart = useMemo(() => lastDays(recent, CHART_DAYS), [recent])
  const split = useMemo(() => splits(recent), [recent])

  if (data === null) return <NotFoundPage />
  if (data === undefined) {
    return (
      <Page>
        <div className="h-8 w-40 animate-pulse rounded-btn bg-surface-2" />
        <div className="mt-5 h-48 animate-pulse rounded-card bg-surface-2" />
      </Page>
    )
  }

  const t = data.totals
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
        subtitle={`Anonymous aggregate counts · ${data.dayCount} day${data.dayCount === 1 ? '' : 's'} recorded`}
        action={<Button variant="ghost" size="sm" onClick={() => void signOut()}>Sign out</Button>}
      />

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

      <DemoBoardSwitch token={token} />

      <div className="mt-5">
        <VisitsChart points={chart} />
      </div>

      <div className="mt-5">
        <SplitTable caption={`Unique devices · last ${CHART_DAYS} days`} groups={split} />
      </div>

      <p className="mt-4 text-xs text-muted">
        Splits count each device once per day. Installed-app sessions: {t.installedSessions ?? 0}. Totals are all-time.
      </p>
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
