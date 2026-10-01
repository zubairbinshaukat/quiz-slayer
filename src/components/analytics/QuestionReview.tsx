import { useState } from 'react'
import { OPTION_LETTERS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { FilterChip } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import type { Answer, Question } from '../../types'

function ReviewItem({ question, answer, index }: { question: Question; answer: Answer; index: number }) {
  const [open, setOpen] = useState(false)
  const correct = answer === question.correctIndex
  const skipped = answer === null
  return (
    <li className="card card-hover cv-row-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="press flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
      >
        <span
          className={cn(
            'keycap size-8 shrink-0 text-[13px]',
            correct ? 'border-success bg-success text-bg' : skipped ? 'text-muted' : 'border-danger bg-danger text-bg',
          )}
        >
          <span aria-hidden="true">{answer === null ? '–' : (OPTION_LETTERS[answer] ?? answer + 1)}</span>
          <span className="sr-only">{correct ? 'Correct' : skipped ? 'Skipped' : 'Wrong'}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[11px] text-muted">Q{index + 1}</span>
          <span className={cn('block text-sm font-medium', !open && 'line-clamp-2')}>{question.text}</span>
        </span>
        <Icon name="chevronDown" size={18} className={cn('shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="animate-fade-in space-y-2 border-t border-line px-4 pt-3 pb-4">
          {question.options.map((option, i) => {
            const isAnswer = i === question.correctIndex
            const isWrongPick = i === answer && !isAnswer
            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2.5 rounded-btn px-3 py-2 text-sm',
                  isAnswer && 'bg-success/10 text-success',
                  isWrongPick && 'bg-danger/10 text-danger',
                  !isAnswer && !isWrongPick && 'text-muted',
                )}
              >
                <span className="keycap h-6 min-w-6 shrink-0 text-[11px]">{OPTION_LETTERS[i] ?? i + 1}</span>
                <span className="flex-1 pt-0.5">{option}</span>
                {isAnswer && <span className="shrink-0 pt-0.5 text-xs font-bold">Answer</span>}
                {isWrongPick && <span className="shrink-0 pt-0.5 text-xs font-bold">Your pick</span>}
              </div>
            )
          })}
          {(question.shortExplanation || question.explanation) && (
            <div className="mt-3 rounded-btn bg-surface-2 p-3 text-sm leading-relaxed">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Explanation</p>
              {question.shortExplanation && <p>{question.shortExplanation}</p>}
              {question.explanation && question.explanation !== question.shortExplanation && (
                <div className="mt-2 space-y-2 text-muted">
                  {question.explanation.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export function QuestionReview({ questions, answers }: { questions: Question[]; answers: Answer[] }) {
  const [filter, setFilter] = useState<'all' | 'wrong'>('all')
  const items = questions
    .map((q, i) => ({ q, a: answers[i] ?? null, i }))
    .filter(({ q, a }) => filter === 'all' || a !== q.correctIndex)
  const wrongCount = questions.filter((q, i) => answers[i] !== q.correctIndex).length

  return (
    <section aria-labelledby="review-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="review-heading" className="text-lg font-bold tracking-[-0.01em] lg:text-xl">Review</h2>
        <div className="flex gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All {questions.length}</FilterChip>
          <FilterChip active={filter === 'wrong'} onClick={() => setFilter('wrong')}>Wrong {wrongCount}</FilterChip>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="card px-4 py-8 text-center text-sm text-muted">Nothing wrong here. Clean sweep.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ q, a, i }) => <ReviewItem key={`${q.id}-${i}`} question={q} answer={a} index={i} />)}
        </ul>
      )}
    </section>
  )
}
