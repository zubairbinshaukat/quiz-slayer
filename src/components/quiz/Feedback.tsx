import { useId } from 'react'
import { FEEDBACK_EMOJI } from '../../lib/emoji3d'
import { OPTION_LETTERS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { XP_PER_CORRECT } from '../../lib/xp'
import { Button } from '../ui/Button'
import { Emoji3D } from '../ui/Emoji3D'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'
import type { Question } from '../../types'

interface FeedbackProps {
  question: Question
  correct: boolean
  /** "Read full explanation" expanded (also toggled by the E key) */
  expanded: boolean
  onToggle: () => void
}

/** Explanation text: the short answer first, then the long one (deduplicated). */
function paragraphs(q: Question): string[] {
  const out: string[] = []
  if (q.shortExplanation) out.push(q.shortExplanation)
  if (q.explanation && q.explanation !== q.shortExplanation) out.push(...q.explanation.split('\n\n'))
  return out
}

/** Emoji + title + sub-line + 3-line explanation with a "Read full explanation" expander. */
function FeedbackContent({ question, correct, expanded, onToggle }: FeedbackProps) {
  const id = useId()
  const paras = paragraphs(question)
  const long = paras.join(' ').length > 170 || paras.length > 1
  const letter = OPTION_LETTERS[question.correctIndex] ?? ''
  return (
    <div aria-live="polite">
      <div className="flex items-center gap-3">
        <Emoji3D emoji={correct ? FEEDBACK_EMOJI.correct : FEEDBACK_EMOJI.wrong} size={40} eager />
        <div className="min-w-0">
          <p className="font-display text-[20px] font-extrabold leading-tight tracking-[-0.02em]">{correct ? 'Correct!' : 'Not quite'}</p>
          <p className="mt-0.5 text-sm text-muted">
            {correct ? `+${XP_PER_CORRECT} XP · keep the streak going` : `Correct answer: ${letter}`}
          </p>
        </div>
      </div>
      {paras.length > 0 && (
        <div id={id} className="mt-3.5 text-[16px] leading-[1.55]">
          {expanded || !long ? (
            <div className="space-y-2.5">
              {paras.map((p, i) => (
                <p key={i} className={i > 0 ? 'text-muted' : undefined}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="line-clamp-3">{paras.join(' ')}</p>
          )}
        </div>
      )}
      {long && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={id}
          className="press -ml-2 mt-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-btn px-2 text-sm font-bold text-accent-fg hover:bg-accent/10"
        >
          {expanded ? 'Show less' : 'Read full explanation'}
          <Icon name="chevronDown" size={16} strokeWidth={2.5} className={cn('transition-transform duration-200', expanded && 'rotate-180')} />
          <span className="keycap max-md:hidden" aria-hidden="true">E</span>
        </button>
      )}
    </div>
  )
}

const TINT = {
  correct: 'bg-success/12 border-success/25',
  wrong: 'bg-danger/12 border-danger/25',
}

/** Inline (tablet / desktop) tinted feedback panel under the options. */
export function FeedbackPanel(props: FeedbackProps) {
  return (
    <div className={cn('slide-up mt-5 rounded-[16px] border p-4 sm:p-5', props.correct ? TINT.correct : TINT.wrong)}>
      <FeedbackContent {...props} />
    </div>
  )
}

interface FeedbackSheetProps extends FeedbackProps {
  open: boolean
  isLast: boolean
  onClose: () => void
  onNext: () => void
}

/** Mobile: reopen the feedback sheet after it was dismissed. */
export function ShowFeedbackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-muted hover:text-fg"
    >
      <Icon name="info" size={16} /> Show explanation
    </button>
  )
}

/** Mobile feedback: bottom sheet at the same tick as the colour reveal, with Next pinned. */
export function FeedbackSheet({ open, isLast, onClose, onNext, ...props }: FeedbackSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      hideClose
      className="rounded-t-[28px] dark:bg-surface-2"
      footer={
        <Button size="lg" className="min-h-14 w-full rounded-full text-[17px] shadow-[0_8px_24px_-8px_rgb(245_183_58/0.6)]" onClick={onNext} data-autofocus>
          {isLast ? (
            <>
              See results <Emoji3D emoji={FEEDBACK_EMOJI.finish} size={18} eager />
            </>
          ) : (
            <>
              Next question <Icon name="arrowRight" size={18} strokeWidth={2.5} />
            </>
          )}
        </Button>
      }
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-40',
          props.correct ? 'bg-linear-to-b from-success/14 to-transparent' : 'bg-linear-to-b from-danger/14 to-transparent',
        )}
      />
      <div className="relative pt-1">
        <FeedbackContent {...props} />
      </div>
    </Sheet>
  )
}
