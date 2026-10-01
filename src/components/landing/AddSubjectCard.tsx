import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useLiteMode } from '../../hooks/useLiteMode'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'

export function AddSubjectCard({ index = 0, className }: { index?: number; className?: string }) {
  const { lite } = useLiteMode()
  return (
    <Link
      to={ROUTES.UPLOAD}
      viewTransition={!lite}
      className={cn(
        'press rise group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong p-5 text-center',
        'text-muted transition-colors hover:border-fg/30 hover:bg-surface/60 hover:text-fg',
        className,
      )}
      style={{ '--i': index } as CSSProperties}
    >
      <span className="flex size-12 items-center justify-center rounded-full border border-line bg-surface-2 text-fg transition-colors group-hover:bg-surface-3">
        <Icon name="plus" size={22} />
      </span>
      <span>
        <span className="block text-base font-bold text-fg">Add subject</span>
        <span className="mt-0.5 block text-sm">Upload JSON or convert notes with AI</span>
      </span>
    </Link>
  )
}
