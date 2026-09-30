import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeColor = 'default' | 'accent' | 'green' | 'red' | 'amber'

interface BadgeProps {
  children: ReactNode
  className?: string
  color?: BadgeColor
}

export function Badge({ children, className, color = 'default' }: BadgeProps) {
  const colors: Record<BadgeColor, string> = {
    default: 'bg-surface-secondary text-content-secondary',
    accent: 'bg-themed-accent/10 text-themed-accent',
    green: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    red: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}
