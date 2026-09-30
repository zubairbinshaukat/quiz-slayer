import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'

export function AddSubjectCard({ index = 0, className }: { index?: number; className?: string }) {
  return (
    <Link
      to={ROUTES.UPLOAD}
      viewTransition
      className={cn(
        'press rise flex min-h-[232px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong p-4 text-center',
        'text-muted hover:border-accent hover:text-fg',
        className,
      )}
      style={{ '--i': index } as CSSProperties}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-accent-fg">
        <Icon name="plus" size={22} />
      </span>
      <span>
        <span className="block text-base font-bold text-fg">Add subject</span>
        <span className="mt-0.5 block text-sm">Upload JSON or convert notes with AI</span>
      </span>
    </Link>
  )
}
