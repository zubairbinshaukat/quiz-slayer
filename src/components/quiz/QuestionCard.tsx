import { OptionButton } from './OptionButton'
import type { Answer, Question } from '../../types'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  selectedIndex: Answer
  isSubmitted: boolean
  onSelect: (optionIndex: number) => void
}

export function QuestionCard({
  question,
  questionNumber,
  selectedIndex,
  isSubmitted,
  onSelect,
}: QuestionCardProps) {
  return (
    // key forces a remount per question so the entrance animation replays
    <div key={question.id} className="animate-fade-up">
      {/* Question text */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-content-secondary uppercase tracking-wide mb-3">
          Question {questionNumber}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-content-primary leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <OptionButton
            key={i}
            option={option}
            index={i}
            selectedIndex={selectedIndex}
            correctIndex={question.correctIndex}
            isSubmitted={isSubmitted}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  )
}
