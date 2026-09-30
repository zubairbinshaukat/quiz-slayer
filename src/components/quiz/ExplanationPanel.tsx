import { useId } from 'react'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import { OPTION_LETTERS } from '../../lib/constants'
import type { Question } from '../../types'

interface ExplanationPanelProps {
  question: Question
  isCorrect: boolean
  expanded: boolean
  onToggle: () => void
}

function quickAnswer(q: Question): string {
  if (q.shortExplanation) return q.shortExplanation
  return `${(q.explanation ?? '').split('.').slice(0, 2).join('.')}.`
}

/** Slides up under the options once the question is answered. */
export function ExplanationPanel({ question, isCorrect, expanded, onToggle }: ExplanationPanelProps) {
  const moreId = useId()
  const hasText = Boolean(question.shortExplanation || question.explanation)
  const correctLetter = OPTION_LETTERS[question.correctIndex] ?? ''

  return (
    <div className="mt-4 animate-fade-up rounded-card border border-line bg-surface-2 p-4" aria-live="polite">
      <p className={cn('flex items-center gap-2 text-sm font-bold', isCorrect ? 'text-success' : 'text-danger')}>
        <Icon name={isCorrect ? 'check' : 'x'} size={16} strokeWidth={3} />
        {isCorrect ? 'Correct' : `Not quite — the answer is ${correctLetter}`}
      </p>

      {hasText && (
        <div className="mt-3 flex gap-3">
          <Icon3D name="bulb" size={32} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Quick answer</p>
            <p className="mt-1 text-[15px] leading-relaxed">{quickAnswer(question)}</p>

            {question.explanation && (
              <>
                <button
                  type="button"
                  onClick={onToggle}
                  aria-expanded={expanded}
                  aria-controls={moreId}
                  className="press -ml-2 mt-2 inline-flex min-h-11 items-center gap-2 rounded-btn px-2 text-sm font-semibold text-accent-fg hover:bg-surface"
                >
                  <Icon name="chevronDown" size={16} className={cn('transition-transform duration-200', expanded && 'rotate-180')} />
                  {expanded ? 'Show less' : 'Know more'}
                  <span className="keycap max-md:hidden" aria-hidden="true">E</span>
                </button>
                {expanded && (
                  <div id={moreId} className="mt-2 animate-fade-in space-y-2 border-t border-line pt-3 text-[15px] leading-relaxed text-muted">
                    {question.explanation.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
