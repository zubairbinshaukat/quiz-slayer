import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value?: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value = 0, className, showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-content-secondary mb-1.5">
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-themed-accent rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
