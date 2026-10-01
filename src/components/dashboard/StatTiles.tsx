import { useMemo } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { dailyCounts } from '../../lib/streak'
import { useXp } from '../../lib/xp'
import { Icon3D } from '../ui/Icon3D'
import { ProgressRing } from '../ui/ProgressRing'
import { Sparkline } from '../ui/Sparkline'
import { StatTile } from '../ui/StatTile'
import type { HistoryEntry } from '../../types'

interface StatTilesProps {
  history: HistoryEntry[]
  mistakes: number
}

/** Attempts (14-day bars), average score (ring) and mistakes to clear (recent wrong-answer trend). */
export function StatTiles({ history, mistakes }: StatTilesProps) {
  const attempts = useCountUp(history.length, 0.8)
  const avg = history.length ? Math.round(history.reduce((s, e) => s + e.score, 0) / history.length) : 0
  const avgShown = useCountUp(avg, 0.8)
  const mistakesShown = useCountUp(mistakes, 0.8)
  const xpShown = useCountUp(useXp(), 0.8)

  const perDay = useMemo(() => dailyCounts(history, 14).map((d) => d.count), [history])
  const wrongTrend = useMemo(
    () =>
      [...history]
        .sort((a, b) => a.dateTaken.localeCompare(b.dateTaken))
        .slice(-10)
        .map((e) => Math.max(0, e.total - e.correct)),
    [history],
  )

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Your stats">
      <StatTile
        index={2}
        label="Attempts"
        value={attempts}
        visual={<Sparkline values={perDay} width={46} height={26} color="var(--color-info)" />}
      />
      <StatTile
        index={3}
        label="Avg score"
        value={history.length ? `${avgShown}%` : '—'}
        visual={<ProgressRing value={avg / 100} size={30} stroke={4} gradient label={`Average ${avg}%`} />}
      />
      <StatTile
        index={4}
        label="Mistakes"
        value={mistakesShown}
        tone={mistakes > 0 ? 'text-danger' : undefined}
        visual={<Sparkline kind="line" values={wrongTrend.length ? wrongTrend : [0]} width={46} height={26} color="var(--color-danger)" />}
      />
      <StatTile
        index={5}
        label="XP"
        value={<span className="font-mono">{xpShown.toLocaleString('en-US')}</span>}
        visual={<Icon3D name="star" size={30} />}
      />
    </dl>
  )
}
