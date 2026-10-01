import { Button } from '../ui/Button'
import { Icon3D } from '../ui/Icon3D'
import { Sheet } from '../ui/Sheet'

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['1', '–', '5'], action: 'Pick an option' },
  { keys: ['A', '–', 'E'], action: 'Pick an option' },
  { keys: ['↵'], action: 'Next question' },
  { keys: ['⌫'], action: 'Previous question' },
  { keys: ['←', '→'], action: 'Previous / next' },
  { keys: ['E'], action: 'Toggle “Know more” (practice)' },
  { keys: ['Ctrl', '↵'], action: 'Submit quiz' },
  { keys: ['?'], action: 'Show this sheet' },
]

export function ShortcutsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Keyboard shortcuts" description="Keys are ignored while typing or when a dialog is open.">
      <ul className="divide-y divide-line">
        {SHORTCUTS.map((s) => (
          <li key={s.keys.join('') + s.action} className="flex min-h-12 items-center justify-between gap-4">
            <span className="text-sm">{s.action}</span>
            <span className="flex items-center gap-1">
              {s.keys.map((k, i) => (k === '–' ? <span key={i} className="text-muted">–</span> : <kbd key={i} className="keycap">{k}</kbd>))}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

interface ResumeSheetProps {
  open: boolean
  answered: number
  total: number
  onResume: () => void
  onStartFresh: () => void
}

export function ResumeSheet({ open, answered, total, onResume, onStartFresh }: ResumeSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onStartFresh}
      title="Pick up where you left off?"
      description={`${answered} of ${total} questions answered.`}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onStartFresh}>Start fresh</Button>
          <Button className="flex-1" onClick={onResume} data-autofocus>Resume</Button>
        </div>
      }
    >
      <div className="flex justify-center py-2">
        <Icon3D name="bookmark" size={96} eager />
      </div>
    </Sheet>
  )
}

interface SubmitSheetProps {
  open: boolean
  /** Timed exam wording (answers are revealed on submit). */
  exam?: boolean
  answered: number
  total: number
  onCancel: () => void
  onConfirm: () => void
}

export function SubmitSheet({ open, exam = false, answered, total, onCancel, onConfirm }: SubmitSheetProps) {
  const unanswered = total - answered
  const status =
    unanswered > 0
      ? `${unanswered} question${unanswered === 1 ? ' is' : 's are'} unanswered and will count as wrong.`
      : `All ${total} questions answered.`
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      title={exam ? 'Submit exam?' : 'Submit quiz?'}
      description={exam ? `${status} You'll see your answers after submitting.` : status}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Keep going</Button>
          <Button className="flex-1" onClick={onConfirm} data-autofocus>Submit</Button>
        </div>
      }
    >
      <div className="flex justify-center py-2">
        <Icon3D name="flag" size={88} eager />
      </div>
    </Sheet>
  )
}
