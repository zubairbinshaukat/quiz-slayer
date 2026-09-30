import { useCountUp } from '../../hooks/useCountUp'

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  className?: string
}

/** Renders a number that counts up to `to`. Thin wrapper over useCountUp. */
export function CountUp({ to, from = 0, duration = 1, className }: CountUpProps) {
  const value = useCountUp(to, duration, from)
  return <span className={className}>{value}</span>
}
