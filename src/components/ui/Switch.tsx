import { cn } from '../../lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

/** iOS-style toggle; amber when on. */
export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:opacity-50',
        checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-3',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0.5 size-[22px] rounded-full shadow-[0_2px_6px_rgb(0_0_0/0.35)] transition-transform duration-200 ease-out',
          checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white',
        )}
      />
    </button>
  )
}
