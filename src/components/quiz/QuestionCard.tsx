import type { ReactNode } from 'react'
import { getSubjectIcon } from '../../lib/subjectUtils'
import { Icon3D } from '../ui/Icon3D'
import { FeedbackPanel } from './Feedback'
import { OptionButton, type OptionState } from './OptionButton'
import type { Answer, Question } from '../../types'

interface QuestionCardProps {
  question: Question
  index: number
  total: number
  subject: string
  slug: string
  answer: Answer
  /** Timed exam: picks can change and correctness stays hidden. */
  exam: boolean
  expanded: boolean
  /** Keycap flash replay: option index + counter */
  flash: { index: number; n: number }
  /** Answered just now (not revisited): the pick shakes / pops "+10 XP" once */
  fresh?: boolean
  /** Prev / Next row shown inside the card from md up (mobile uses the pinned bar) */
  footer?: ReactNode
  onSelect: (option: number) => void
  onToggleMore: () => void
}

/** One soft card: subject chip + counter, question, option pills, feedback (md+), nav row (md+). */
export function QuestionCard({
  question, index, total, subject, slug, answer, exam, expanded, flash, fresh = false, footer, onSelect, onToggleMore,
}: QuestionCardProps) {
  function optionState(i: number): OptionState {
    if (answer === null) return 'idle'
    if (exam) return i === answer ? 'selected' : 'idle'
    if (i === question.correctIndex) return 'correct'
    return i === answer ? 'wrong' : 'dim'
  }

  return (
    <section className="vt-question" aria-labelledby="question-text">
      <div className="rounded-[24px] border border-line bg-surface p-5 shadow-[var(--hl),var(--lift)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-3 pl-1.5 text-[13px] font-semibold">
            <Icon3D name={getSubjectIcon(slug)} size={22} eager />
            <span className="truncate">{subject}</span>
          </span>
          <span className="shrink-0 text-[13px] font-medium text-muted">
            Question <span className="font-mono text-fg">{index + 1}</span> of <span className="font-mono">{total}</span>
          </span>
        </div>

        <h1 id="question-text" className="mt-5 font-sans text-[20px] font-bold leading-[1.4] tracking-[-0.01em] sm:text-[22px]">
          {question.text}
        </h1>

        <div role="group" aria-label="Answer options" className="mt-6 space-y-3">
          {question.options.map((option, i) => (
            <OptionButton
              key={i}
              option={option}
              index={i}
              state={optionState(i)}
              locked={!exam && answer !== null}
              flash={flash.index === i ? flash.n : 0}
              fresh={fresh && !exam && i === answer}
              onSelect={() => onSelect(i)}
            />
          ))}
        </div>

        {!exam && answer !== null && (
          <div className="max-md:hidden">
            <FeedbackPanel
              key={index}
              question={question}
              correct={answer === question.correctIndex}
              expanded={expanded}
              onToggle={onToggleMore}
            />
          </div>
        )}

        {footer && <div className="mt-6 max-md:hidden">{footer}</div>}
      </div>
    </section>
  )
}
