import { useState } from 'react'
import { getSubjectIcon } from '../../lib/subjectUtils'
import { Button } from '../ui/Button'
import { Icon3D } from '../ui/Icon3D'
import { Segmented, type SegmentOption } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'
import type { Question, Subject } from '../../types'

type QuestionSet = 'professor' | 'guess'
type CountMode = '10' | '20' | 'all' | 'custom'

interface QuizSetupSheetProps {
  subject: Subject | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (count: number, questionPool: Question[]) => void
}

export function QuizSetupSheet({ subject, isOpen, onClose, onConfirm }: QuizSetupSheetProps) {
  const [questionSet, setQuestionSet] = useState<QuestionSet>('professor')
  const [countMode, setCountMode] = useState<CountMode>('all')
  const [customCount, setCustomCount] = useState('15')

  if (!subject) return null

  const hasGuess = subject.guessQuestions.length > 0
  const pool = questionSet === 'guess' && hasGuess ? subject.guessQuestions : subject.questions
  const poolSize = pool.length
  const parsedCustom = Number.parseInt(customCount, 10)
  const customValid = Number.isFinite(parsedCustom) && parsedCustom >= 1

  const count =
    countMode === 'all' ? poolSize
      : countMode === 'custom' ? Math.min(customValid ? parsedCustom : 0, poolSize)
        : Math.min(Number(countMode), poolSize)

  const countOptions: SegmentOption<CountMode>[] = [
    { value: '10', label: '10', disabled: poolSize < 10 },
    { value: '20', label: '20', disabled: poolSize < 20 },
    { value: 'all', label: 'All', hint: String(poolSize) },
    { value: 'custom', label: 'Custom' },
  ]

  function changeSet(next: QuestionSet) {
    setQuestionSet(next)
    setCountMode('all')
  }

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title={subject.subject}
      description={`${subject.questionCount} professor questions${hasGuess ? ` · ${subject.guessQuestions.length} AI practice` : ''}`}
      footer={
        <Button size="lg" className="w-full" disabled={count < 1} onClick={() => onConfirm(count, pool)} data-autofocus>
          Start {count} question{count === 1 ? '' : 's'}
        </Button>
      }
    >
      <div className="mb-5 flex items-center justify-center">
        <Icon3D name={getSubjectIcon(subject.slug)} size={88} eager />
      </div>

      {hasGuess && (
        <fieldset className="mb-5">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Question set</legend>
          <Segmented
            label="Question set"
            value={questionSet}
            onChange={changeSet}
            options={[
              { value: 'professor', label: 'Professor', hint: `${subject.questionCount} official` },
              { value: 'guess', label: 'From documents', hint: `${subject.guessQuestions.length} AI` },
            ]}
          />
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">How many questions?</legend>
        <Segmented label="Question count" value={countMode} onChange={setCountMode} options={countOptions} />
        {countMode === 'custom' && (
          <label className="mt-3 flex items-center gap-3 text-sm text-muted animate-fade-up">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={poolSize}
              value={customCount}
              onChange={(e) => setCustomCount(e.target.value)}
              className="min-h-11 w-24 rounded-btn border border-line bg-surface-2 px-3 text-base font-semibold text-fg focus:border-accent focus:outline-none"
              aria-label="Custom question count"
            />
            of {poolSize} questions
          </label>
        )}
      </fieldset>
    </Sheet>
  )
}
