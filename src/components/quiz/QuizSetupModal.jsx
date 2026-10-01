import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { getColorClasses } from '../../lib/constants'
import { getSubjectColor, getSubjectIconKey } from '../../lib/subjectUtils'
import { SubjectIcon } from '../ui/SubjectIcons'
import { cn } from '../../lib/utils'

export function QuizSetupModal({ subject, isOpen, onClose, onConfirm }) {
  const [questionSet, setQuestionSet] = useState('professor')
  const [mode, setMode] = useState('all')
  const [customCount, setCustomCount] = useState(10)

  if (!subject) return null

  const hasGuessQuestions = (subject.guessQuestions?.length ?? 0) > 0
  const activePool = questionSet === 'guess' && hasGuessQuestions
    ? subject.guessQuestions
    : subject.questions
  const poolSize = activePool.length

  function handleStart() {
    const count = mode === 'all' ? poolSize : Math.min(customCount, poolSize)
    onConfirm(count, activePool)
  }

  const color = getSubjectColor(subject.slug)
  const iconKey = getSubjectIconKey(subject.slug)
  const c = getColorClasses(color)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quiz Setup">
      {/* Subject info */}
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-xl mb-6 bg-gradient-to-r border',
        c.gradient, c.gradientDark, c.border, c.borderDark
      )}>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.badge, c.badgeDark, c.text, c.textDark)}>
          <SubjectIcon iconKey={iconKey} className="w-5 h-5" />
        </div>
        <div>
          <p className={cn('font-bold text-base', c.text, c.textDark)}>{subject.subject}</p>
          <p className="text-xs text-content-secondary">{subject.questionCount} professor questions{hasGuessQuestions ? ` · ${subject.guessQuestions.length} AI questions` : ''}</p>
        </div>
      </div>

      {/* Question set selector — only shown when guess_questions exist */}
      {hasGuessQuestions && (
        <div className="mb-5">
          <p className="text-xs font-bold text-content-secondary uppercase tracking-wide mb-3">Question Set</p>
          <div className="grid grid-cols-2 gap-2">
            <label className={cn(
              'flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all',
              questionSet === 'professor'
                ? 'border-themed-accent bg-themed-accent/8'
                : 'border-themed-border hover:border-themed-accent/40'
            )}>
              <div className="flex items-center gap-2">
                <input type="radio" name="qset" value="professor" checked={questionSet === 'professor'} onChange={() => { setQuestionSet('professor'); setMode('all') }} className="accent-themed-accent" />
                <span className="text-sm font-bold text-content-primary">Professor</span>
              </div>
              <p className="text-xs text-content-secondary pl-5">{subject.questionCount} official Qs</p>
            </label>

            <label className={cn(
              'flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all',
              questionSet === 'guess'
                ? 'border-themed-accent bg-themed-accent/8'
                : 'border-themed-border hover:border-themed-accent/40'
            )}>
              <div className="flex items-center gap-2">
                <input type="radio" name="qset" value="guess" checked={questionSet === 'guess'} onChange={() => { setQuestionSet('guess'); setMode('all') }} className="accent-themed-accent" />
                <span className="text-sm font-bold text-content-primary">MCQS genreated from Documents shared by Sir</span>
              </div>
              <p className="text-xs text-content-secondary pl-5">{subject.guessQuestions.length} practice Qs</p>
            </label>
          </div>
        </div>
      )}

      {/* Question count selection */}
      <p className="text-xs font-bold text-content-secondary uppercase tracking-wide mb-3">
        How many questions?
      </p>

      <div className="space-y-3 mb-6">
        <label className={cn(
          'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
          mode === 'all' ? 'border-themed-accent bg-themed-accent/8' : 'border-themed-border hover:border-themed-accent/40 hover:bg-surface-secondary'
        )}>
          <input type="radio" name="mode" value="all" checked={mode === 'all'} onChange={() => setMode('all')} className="accent-themed-accent w-4 h-4" />
          <div>
            <p className="font-semibold text-content-primary text-sm">All Questions</p>
            <p className="text-xs text-content-secondary">Attempt all {poolSize} questions</p>
          </div>
        </label>

        <label className={cn(
          'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
          mode === 'custom' ? 'border-themed-accent bg-themed-accent/8' : 'border-themed-border hover:border-themed-accent/40 hover:bg-surface-secondary'
        )}>
          <input type="radio" name="mode" value="custom" checked={mode === 'custom'} onChange={() => setMode('custom')} className="accent-themed-accent w-4 h-4 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-content-primary text-sm mb-2">Custom Count</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={poolSize}
                value={customCount}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v)) setCustomCount(Math.min(Math.max(1, v), poolSize))
                }}
                onFocus={() => setMode('custom')}
                className={cn(
                  'w-20 px-3 py-1.5 text-sm rounded-lg border font-semibold text-content-primary',
                  'bg-surface-primary border-themed-border focus:outline-none',
                  'focus:border-themed-accent focus:ring-1 focus:ring-themed-accent'
                )}
              />
              <span className="text-xs text-content-secondary">of {poolSize} questions</span>
            </div>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={handleStart}>Start Quiz →</Button>
      </div>
    </Modal>
  )
}
