import { AnimatePresence, motion } from 'framer-motion'
import { OptionButton } from './OptionButton'

export function QuestionCard({
  question,
  questionNumber,
  selectedIndex,
  isSubmitted,
  onSelect,
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
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

      </motion.div>
    </AnimatePresence>
  )
}
