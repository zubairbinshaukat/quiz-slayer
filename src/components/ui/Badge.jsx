import { cn } from '../../lib/utils'

export function Badge({ children, className, color = 'default' }) {
  const colors = {
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
