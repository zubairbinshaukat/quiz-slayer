import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface PageProps {
  children: ReactNode
  /** 640px default; 760px for landing / leaderboard. */
  wide?: boolean
  className?: string
}

/** Centred page column with room for the mobile tab bar. */
export function Page({ children, wide = false, className }: PageProps) {
  return (
    <main
      id="main"
      className={cn(
        'mx-auto w-full px-4 pt-5 pb-[calc(96px+env(safe-area-inset-bottom))] md:pt-8 md:pb-16',
        wide ? 'max-w-[760px]' : 'max-w-[640px]',
        className,
      )}
    >
      {children}
    </main>
  )
}

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  eyebrow?: ReactNode
}

export function PageHeader({ title, subtitle, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{eyebrow}</p>}
        <h1 className="text-[28px] sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
