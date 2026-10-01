import { useEffect, useRef, useState } from 'react'
import { cn, formatClock } from '../../lib/utils'
import { Icon } from '../ui/Icon'

const WARN_SECONDS = 60

interface ExamCountdownProps {
  /** Epoch ms when time runs out */
  deadline: number
  /** Fired once when the countdown reaches 0:00 */
  onExpire: () => void
}

/** Self-ticking mm:ss countdown; turns coral in the last minute. */
export function ExamCountdown({ deadline, onExpire }: ExamCountdownProps) {
  const [now, setNow] = useState(() => Date.now())
  const expireRef = useRef(onExpire)
  const firedRef = useRef(false)

  useEffect(() => {
    expireRef.current = onExpire
  })

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  const left = Math.max(0, Math.ceil((deadline - now) / 1000))

  useEffect(() => {
    if (left > 0 || firedRef.current) return
    firedRef.current = true
    expireRef.current()
  }, [left])

  const warn = left < WARN_SECONDS
  return (
    <span
      role="timer"
      aria-label={`Time left ${formatClock(left)}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-sm font-semibold',
        warn ? 'bg-danger/12 text-danger' : 'text-muted',
      )}
    >
      <Icon name="clock" size={14} />
      {formatClock(left)}
    </span>
  )
}
