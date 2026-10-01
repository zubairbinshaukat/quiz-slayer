import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-accent text-accent-ink hover:bg-accent-hover font-bold shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_24px_-10px_rgb(245_183_58/0.55)]',
  secondary: 'bg-surface-2 text-fg border border-line hover:border-line-strong hover:bg-surface-3 font-semibold',
  /** Transparent with a hairline: secondary actions next to a primary CTA */
  outline: 'bg-transparent text-fg border border-line-strong hover:bg-surface-2 font-semibold',
  ghost: 'bg-transparent text-muted hover:text-fg hover:bg-surface-2 font-semibold',
  danger: 'bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20 font-semibold',
} as const

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-[15px]',
  lg: 'min-h-12 px-5 text-base',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function Button({ children, variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'press inline-flex items-center justify-center gap-2 rounded-btn select-none',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
}

/** 44×44 icon-only button with an accessible label. */
export function IconButton({ label, active, className, children, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'press inline-flex size-11 shrink-0 items-center justify-center rounded-btn',
        active ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
