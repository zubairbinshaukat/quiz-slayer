import { useState } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Icon3D } from '../ui/Icon3D'
import { Sheet } from '../ui/Sheet'

const WARNING_EN = [
  'Not from your professor — zero authenticity guarantee.',
  'AI-generated MCQs. None of this is compulsory for your exam.',
  'Brutally hard. Expect trick questions and nightmare-level difficulty.',
  'Some questions may be off-syllabus, outdated, or just wrong.',
  'Continue at your own risk. No refunds on your grade.',
]

const WARNING_UR = [
  'یہ سر کی طرف سے نہیں — اصلیت کی کوئی ضمانت نہیں۔',
  'یہاں ہر سوال AI نے بنایا ہے۔ امتحان میں آنا لازمی نہیں۔',
  'انتہائی مشکل — مشکل سوالات اور پریشان کن سوالات کی توقع رکھیں۔',
  'کچھ سوالات نصاب سے باہر، پرانے، یا بالکل غلط ہو سکتے ہیں۔',
  'آگے بڑھنے کا مطلب ہے آپ خود ذمہ دار ہیں۔ گریڈ واپس نہیں ہوگی۔',
]

function WarningList({ lang, lines, rtl }: { lang: string; lines: string[]; rtl?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-danger">{lang}</p>
      <ul className="space-y-1.5" dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'ur' : 'en'}>
        {lines.map((line) => (
          <li key={line} className="flex gap-2 text-sm leading-snug">
            <Icon name="x" size={16} className="mt-0.5 shrink-0 text-danger" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface GuessWarningModalProps {
  isOpen: boolean
  subjectName?: string
  onClose: () => void
  onContinue: (dismissForever: boolean) => void
}

export function GuessWarningModal({ isOpen, subjectName, onClose, onContinue }: GuessWarningModalProps) {
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  function handleContinue() {
    onContinue(neverShowAgain)
    setNeverShowAgain(false)
  }

  function handleClose() {
    setNeverShowAgain(false)
    onClose()
  }

  return (
    <Sheet
      open={isOpen}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-3">
          <Icon3D name="flag" size={40} eager />
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-danger">Hard mode · No mercy</span>
            You were warned.
          </span>
        </span>
      }
      description={subjectName}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>Go back</Button>
          <Button variant="danger" className="flex-1" onClick={handleContinue} data-autofocus>
            I accept — continue
          </Button>
        </div>
      }
    >
      <div className="space-y-4 rounded-card border border-danger/25 bg-danger/5 p-4">
        <WarningList lang="English" lines={WARNING_EN} />
        <div className="border-t border-danger/20" />
        <WarningList lang="اردو" lines={WARNING_UR} rtl />
      </div>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={neverShowAgain}
          onChange={(e) => setNeverShowAgain(e.target.checked)}
          className="size-5 shrink-0 accent-[var(--color-danger)]"
        />
        Never show this again
      </label>
    </Sheet>
  )
}
