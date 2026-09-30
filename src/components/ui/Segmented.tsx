import { cn } from '../../lib/utils'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  hint?: string
  disabled?: boolean
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  label: string
  className?: string
}

/** Pill-style single-choice control (radiogroup semantics). */
export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex gap-1 rounded-full border border-line bg-surface-2 p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'press flex min-h-10 flex-1 flex-col items-center justify-center rounded-full px-3 text-sm font-semibold',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              active ? 'bg-accent text-accent-ink' : 'text-muted hover:text-fg',
            )}
          >
            <span className="leading-tight">{opt.label}</span>
            {opt.hint && (
              <span className={cn('text-[11px] font-medium leading-tight', active ? 'text-accent-ink/70' : 'text-muted')}>
                {opt.hint}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
