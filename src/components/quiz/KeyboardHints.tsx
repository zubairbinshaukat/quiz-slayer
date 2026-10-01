import { IconButton } from '../ui/Button'
import { Icon } from '../ui/Icon'

const HINTS: { keys: string[]; label: string }[] = [
  { keys: ['1', '2', '3', '4', '5'], label: 'Pick an option' },
  { keys: ['Enter'], label: 'Next question' },
  { keys: ['Backspace'], label: 'Previous' },
  { keys: ['E'], label: 'Know more' },
  { keys: ['?'], label: 'All shortcuts' },
]

/** Desktop quiz rail: keycaps for the common shortcuts. */
export function KeyboardHints({ onHelp }: { onHelp: () => void }) {
  return (
    <section className="card p-4" aria-labelledby="kbd-heading">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="kbd-heading" className="eyebrow">Keyboard</h2>
        <IconButton label="All keyboard shortcuts" onClick={onHelp} className="-mr-2 -my-2 size-9">
          <Icon name="keyboard" size={18} />
        </IconButton>
      </div>
      <ul className="space-y-2.5">
        {HINTS.map((h) => (
          <li key={h.label} className="flex items-center justify-between gap-3 text-[13px] text-muted">
            <span>{h.label}</span>
            <span className="flex gap-1">
              {h.keys.map((k) => (
                <kbd key={k} className="keycap h-6 min-w-6 px-1.5 text-[11px]">{k === 'Enter' ? '↵ Enter' : k === 'Backspace' ? '⌫' : k}</kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
