import { OPTION_LETTERS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dim'

interface OptionButtonProps {
  option: string
  index: number
  state: OptionState
  locked: boolean
  /** Changes whenever the matching key is pressed; replays the keycap flash. */
  flash: number
  onSelect: () => void
}

const STATE_CLASSES: Record<OptionState, string> = {
  idle: 'border-line bg-surface hover:border-line-strong hover:bg-surface-2',
  correct: 'border-success bg-success/10',
  wrong: 'border-danger bg-danger/10',
  dim: 'border-line bg-surface opacity-45',
}

const KEYCAP_CLASSES: Record<OptionState, string> = {
  idle: '',
  correct: 'border-success bg-success text-bg',
  wrong: 'border-danger bg-danger text-bg',
  dim: '',
}

export function OptionButton({ option, index, state, locked, flash, onSelect }: OptionButtonProps) {
  const letter = OPTION_LETTERS[index] ?? String(index + 1)
  return (
    <button
      type="button"
      data-quiz-option
      disabled={locked}
      onClick={onSelect}
      className={cn(
        'press flex min-h-14 w-full items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left',
        'disabled:cursor-default',
        STATE_CLASSES[state],
      )}
    >
      <span
        key={flash}
        aria-hidden="true"
        className={cn('keycap shrink-0', flash > 0 && 'keycap-flash', KEYCAP_CLASSES[state])}
      >
        {letter}
      </span>
      <span className="sr-only">Option {letter}: </span>
      <span className="min-w-0 flex-1 text-[15px] leading-snug sm:text-base">{option}</span>
      {state === 'correct' && (
        <span className="flex size-7 shrink-0 animate-pop items-center justify-center rounded-full bg-success text-bg">
          <Icon name="check" size={16} strokeWidth={3} />
          <span className="sr-only">Correct answer</span>
        </span>
      )}
      {state === 'wrong' && (
        <span className="flex size-7 shrink-0 animate-pop items-center justify-center rounded-full bg-danger text-bg">
          <Icon name="x" size={16} strokeWidth={3} />
          <span className="sr-only">Your answer, incorrect</span>
        </span>
      )}
    </button>
  )
}
