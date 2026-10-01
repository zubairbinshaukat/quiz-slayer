import { FEEDBACK_EMOJI } from '../../lib/emoji3d'
import { OPTION_LETTERS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { XP_PER_CORRECT } from '../../lib/xp'
import { Emoji3D } from '../ui/Emoji3D'
import { Icon } from '../ui/Icon'

/** 'selected' marks the pick in a timed exam (no right/wrong until submit). */
export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim'

interface OptionButtonProps {
  option: string
  index: number
  state: OptionState
  locked: boolean
  /** Changes whenever the matching key is pressed; replays the badge flash. */
  flash: number
  /** This option was just picked (this view): plays the shake / "+10 XP" pop once. */
  fresh?: boolean
  onSelect: () => void
}

/** Soft pills: no hard border until a result paints a 2px ring. */
const STATE_CLASSES: Record<OptionState, string> = {
  idle: 'border-transparent bg-surface-2 hover:bg-surface-3 enabled:hover:translate-x-0.5',
  selected: 'border-accent bg-accent/10',
  correct: 'border-success bg-success/12',
  wrong: 'border-danger bg-danger/12',
  dim: 'border-transparent bg-surface-2 opacity-45',
}

const BADGE_CLASSES: Record<OptionState, string> = {
  idle: 'bg-surface text-fg shadow-[0_1px_2px_rgb(0_0_0/0.18)] dark:bg-surface-3',
  selected: 'bg-accent text-accent-ink',
  correct: 'bg-success text-white dark:text-bg',
  wrong: 'bg-danger text-white dark:text-bg',
  dim: 'bg-surface text-muted dark:bg-surface-3',
}

function ResultMark({ correct }: { correct: boolean }) {
  return (
    <span className="flex size-7 shrink-0 animate-pop items-center justify-center">
      <Emoji3D
        emoji={correct ? FEEDBACK_EMOJI.correct : FEEDBACK_EMOJI.wrong}
        size={22}
        eager
        fallback={
          <span className={cn('flex size-6 items-center justify-center rounded-full text-bg', correct ? 'bg-success' : 'bg-danger')}>
            <Icon name={correct ? 'check' : 'x'} size={14} strokeWidth={3} />
          </span>
        }
      />
      <span className="sr-only">{correct ? 'Correct answer' : 'Your answer, incorrect'}</span>
    </span>
  )
}

export function OptionButton({ option, index, state, locked, flash, fresh = false, onSelect }: OptionButtonProps) {
  const letter = OPTION_LETTERS[index] ?? String(index + 1)
  return (
    <button
      type="button"
      data-quiz-option
      disabled={locked}
      aria-pressed={state === 'selected' ? true : undefined}
      onClick={onSelect}
      className={cn(
        'press relative flex min-h-14 w-full items-center gap-3.5 rounded-[16px] border-2 px-3 py-2.5 text-left',
        // Only movement animates: the result colours apply on the very next paint after the click/keypress
        'transition-transform duration-150 disabled:cursor-default',
        STATE_CLASSES[state],
        fresh && state === 'wrong' && 'shake',
      )}
    >
      <span
        key={flash}
        aria-hidden="true"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold',
          flash > 0 && 'keycap-flash',
          BADGE_CLASSES[state],
        )}
      >
        {letter}
      </span>
      <span className="sr-only">Option {letter}: </span>
      <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug sm:text-base">{option}</span>
      {fresh && state === 'correct' && (
        <span aria-hidden="true" className="xp-pop pointer-events-none absolute right-12 -top-2 rounded-full border border-accent/40 bg-surface px-2.5 py-0.5 font-mono text-[13px] font-bold text-accent-fg shadow-[0_6px_16px_-8px_rgb(245_183_58/0.7)]">
          +{XP_PER_CORRECT} XP
        </span>
      )}
      {(state === 'correct' || state === 'wrong') && <ResultMark correct={state === 'correct'} />}
    </button>
  )
}
