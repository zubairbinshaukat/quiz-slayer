import { ExplanationPanel } from './ExplanationPanel'
import { OptionButton, type OptionState } from './OptionButton'
import type { Answer, Question } from '../../types'

interface QuestionCardProps {
  question: Question
  index: number
  answer: Answer
  /** Timed exam: picks can change and correctness stays hidden. */
  exam: boolean
  expanded: boolean
  /** Keycap flash replay: option index + counter */
  flash: { index: number; n: number }
  onSelect: (option: number) => void
  onToggleMore: () => void
}

/** Question text, options and (practice only) the explanation panel. */
export function QuestionCard({ question, index, answer, exam, expanded, flash, onSelect, onToggleMore }: QuestionCardProps) {
  function optionState(i: number): OptionState {
    if (answer === null) return 'idle'
    if (exam) return i === answer ? 'selected' : 'idle'
    if (i === question.correctIndex) return 'correct'
    return i === answer ? 'wrong' : 'dim'
  }

  return (
    <section className="vt-question" aria-labelledby="question-text">
      <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted">Question {index + 1}</p>
      <h1 id="question-text" className="mt-2 text-[19px] font-semibold leading-snug tracking-[-0.01em] sm:text-[21px]">
        {question.text}
      </h1>

      <div role="group" aria-label="Answer options" className="mt-5 space-y-2.5">
        {question.options.map((option, i) => (
          <OptionButton
            key={i}
            option={option}
            index={i}
            state={optionState(i)}
            locked={!exam && answer !== null}
            flash={flash.index === i ? flash.n : 0}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>

      {!exam && answer !== null && (
        <ExplanationPanel
          key={index}
          question={question}
          isCorrect={answer === question.correctIndex}
          expanded={expanded}
          onToggle={onToggleMore}
        />
      )}
    </section>
  )
}
