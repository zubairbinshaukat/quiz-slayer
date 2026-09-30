import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** Static label pill. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', className)}>
      {children}
    </span>
  )
}

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
}

/** Toggleable filter pill (44px tall tap area). */
export function FilterChip({ active, className, children, type = 'button', ...props }: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'press inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap',
        active ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-muted hover:text-fg hover:border-line-strong',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
