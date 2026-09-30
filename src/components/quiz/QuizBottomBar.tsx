import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

interface QuizBottomBarProps {
  canPrev: boolean
  canAdvance: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

/** Thumb-reach action bar pinned above the home indicator. */
export function QuizBottomBar({ canPrev, canAdvance, isLast, onPrev, onNext, onSubmit }: QuizBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-[640px] gap-3 px-4">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onPrev} disabled={!canPrev}>
          <Icon name="back" size={18} />
          Prev
          <span className="keycap max-md:hidden" aria-hidden="true">⌫</span>
        </Button>
        {isLast ? (
          <Button size="lg" className="flex-[2]" onClick={onSubmit} disabled={!canAdvance}>
            Submit
            <Icon name="check" size={18} strokeWidth={2.5} />
            <span className="keycap max-md:hidden border-accent-ink/20 bg-accent-ink/10 text-accent-ink" aria-hidden="true">Ctrl ↵</span>
          </Button>
        ) : (
          <Button size="lg" className="flex-[2]" onClick={onNext} disabled={!canAdvance}>
            Next
            <Icon name="forward" size={18} strokeWidth={2.5} />
            <span className="keycap max-md:hidden border-accent-ink/20 bg-accent-ink/10 text-accent-ink" aria-hidden="true">↵</span>
          </Button>
        )}
      </div>
    </div>
  )
}
