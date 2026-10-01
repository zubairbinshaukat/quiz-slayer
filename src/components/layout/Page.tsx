import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface PageProps {
  children: ReactNode
  /** 'full' = 1180px content area (dashboard, leaderboard, results); 'narrow' = 760px reading column. */
  width?: 'full' | 'narrow'
  className?: string
}

/** Page content area: 16px gutters on mobile, 40px on desktop, room for the floating tab bar. */
export function Page({ children, width = 'full', className }: PageProps) {
  return (
    <main
      id="main"
      className={cn(
        'mx-auto w-full px-4 pt-5 pb-[calc(112px+env(safe-area-inset-bottom))] md:px-6 md:pt-8 md:pb-16 lg:px-10 lg:pt-10',
        width === 'full' ? 'max-w-[1260px]' : 'max-w-[840px]',
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
  className?: string
}

export function PageHeader({ title, subtitle, action, eyebrow, className }: PageHeaderProps) {
  return (
    <div className={cn('rise mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-8', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] lg:text-[36px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
