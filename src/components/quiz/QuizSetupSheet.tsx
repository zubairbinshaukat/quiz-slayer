import { useState } from 'react'
import {
  clearExamState,
  EXAM_PASS_THRESHOLD,
  EXAM_SECONDS_PER_QUESTION,
  getExamMasteredCount,
  getExamQuestionCount,
  getExamState,
  selectExamQuestions,
} from '../../lib/examState'
import { getSubjectIcon } from '../../lib/subjectUtils'
import { formatClock, shuffleArray } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import { Segmented, type SegmentOption } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'
import type { Question, Subject } from '../../types'

type SetupMode = 'practice' | 'exam'
type CountMode = '10' | '20' | 'all' | 'custom'

interface QuizSetupSheetProps {
  subject: Subject | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (questions: Question[], mode: 'quiz' | 'exam') => void
}

const LEGEND = 'mb-2 text-xs font-semibold uppercase tracking-wider text-muted'

export function QuizSetupSheet({ subject, isOpen, onClose, onConfirm }: QuizSetupSheetProps) {
  const [mode, setMode] = useState<SetupMode>('practice')
  const [countMode, setCountMode] = useState<CountMode>('all')
  const [customCount, setCustomCount] = useState('15')
  // Remounted per subject (keyed by slug), so this reads the right subject's mastery
  const [examState, setExamState] = useState(() => (subject ? getExamState(subject.slug) : null))

  if (!subject || !examState) return null

  const pool = subject.questions
  const poolSize = pool.length
  const parsedCustom = Number.parseInt(customCount, 10)
  const customValid = Number.isFinite(parsedCustom) && parsedCustom >= 1

  const practiceCount =
    countMode === 'all' ? poolSize
      : countMode === 'custom' ? Math.min(customValid ? parsedCustom : 0, poolSize)
        : Math.min(Number(countMode), poolSize)
  const examCount = getExamQuestionCount(pool, examState)
  const mastered = getExamMasteredCount(pool, examState)
  const count = mode === 'exam' ? examCount : practiceCount

  const countOptions: SegmentOption<CountMode>[] = [
    { value: '10', label: '10', disabled: poolSize < 10 },
    { value: '20', label: '20', disabled: poolSize < 20 },
    { value: 'all', label: 'All', hint: String(poolSize) },
    { value: 'custom', label: 'Custom' },
  ]

  function start() {
    if (!subject || !examState || count < 1) return
    if (mode === 'exam') onConfirm(selectExamQuestions(pool, examState), 'exam')
    else onConfirm(shuffleArray(pool).slice(0, count), 'quiz')
  }

  function resetMastery() {
    if (!subject) return
    clearExamState(subject.slug)
    setExamState(getExamState(subject.slug))
  }

  const label =
    mode === 'exam'
      ? `Start exam · ${formatClock(count * EXAM_SECONDS_PER_QUESTION)}`
      : `Start ${count} question${count === 1 ? '' : 's'}`

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title={subject.subject}
      description={`${poolSize} question${poolSize === 1 ? '' : 's'}`}
      footer={
        <Button size="lg" className="w-full" disabled={count < 1} onClick={start} data-autofocus>
          {label}
        </Button>
      }
    >
      <div className="mb-5 flex items-center justify-center">
        <Icon3D name={mode === 'exam' ? 'clock' : getSubjectIcon(subject.slug)} size={88} eager />
      </div>

      <fieldset className="mb-5">
        <legend className={LEGEND}>Mode</legend>
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'practice', label: 'Practice', hint: 'Instant feedback' },
            { value: 'exam', label: 'Timed exam', hint: 'Results at the end' },
          ]}
        />
      </fieldset>

      {mode === 'practice' ? (
        <fieldset>
          <legend className={LEGEND}>How many questions?</legend>
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
      ) : examCount > 0 ? (
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2.5">
            <Icon name="file" size={16} className="shrink-0 text-muted" />
            {examCount} questions, {EXAM_SECONDS_PER_QUESTION}s each ({formatClock(examCount * EXAM_SECONDS_PER_QUESTION)} total)
          </li>
          <li className="flex items-center gap-2.5">
            <Icon name="lock" size={16} className="shrink-0 text-muted" />
            Answers stay hidden until you submit
          </li>
          <li className="flex items-center gap-2.5">
            <Icon name="refresh" size={16} className="shrink-0 text-muted" />
            Correct answers are mastered; wrong ones come back. Pass mark {EXAM_PASS_THRESHOLD}%
          </li>
          <li className="flex items-center gap-2.5 font-mono text-xs text-muted">
            Mastered {mastered}/{poolSize}
          </li>
        </ul>
      ) : (
        <div className="rounded-card border border-line bg-surface-2 p-4 text-center text-sm">
          <p className="font-semibold">Every question mastered in exam mode.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={resetMastery}>
            <Icon name="refresh" size={16} />
            Reset exam mastery
          </Button>
        </div>
      )}
    </Sheet>
  )
}
