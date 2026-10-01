import { useEffect, useState } from 'react'
import { formatClock } from '../../lib/utils'
import { Icon } from '../ui/Icon'

/** Self-ticking mm:ss stopwatch (re-renders only itself). */
export function ElapsedTimer({ startTime }: { startTime: Date | null }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const seconds = startTime ? Math.max(0, Math.round((now - startTime.getTime()) / 1000)) : 0
  return (
    <span
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 font-mono text-sm font-semibold text-fg"
      aria-label={`Elapsed ${formatClock(seconds)}`}
      role="timer"
    >
      <Icon name="clock" size={14} className="text-muted" />
      {formatClock(seconds)}
    </span>
  )
}
