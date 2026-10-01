import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

interface QuizNavProps {
  canPrev: boolean
  canAdvance: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

const NEXT_SHADOW = 'shadow-[0_8px_24px_-8px_rgb(245_183_58/0.6)]'

/** "← Previous" ghost pill + "Next question →" amber pill (inside the card from md up). */
export function QuizNavRow({ canPrev, canAdvance, isLast, onPrev, onNext, onSubmit }: QuizNavProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" size="lg" className="rounded-full px-4" onClick={onPrev} disabled={!canPrev}>
        <Icon name="arrowLeft" size={18} />
        Previous
        <span className="keycap" aria-hidden="true">⌫</span>
      </Button>
      {isLast ? (
        <Button size="lg" className={`rounded-full px-6 ${NEXT_SHADOW}`} onClick={onSubmit} disabled={!canAdvance}>
          Submit
          <Icon name="check" size={18} strokeWidth={2.5} />
          <span className="keycap border-accent-ink/20 bg-accent-ink/10 text-accent-ink" aria-hidden="true">Ctrl ↵</span>
        </Button>
      ) : (
        <Button size="lg" className={`rounded-full px-6 ${NEXT_SHADOW}`} onClick={onNext} disabled={!canAdvance}>
          Next question
          <Icon name="arrowRight" size={18} strokeWidth={2.5} />
          <span className="keycap border-accent-ink/20 bg-accent-ink/10 text-accent-ink" aria-hidden="true">↵</span>
        </Button>
      )}
    </div>
  )
}

/** Mobile thumb-reach bar pinned above the home indicator (md+ uses the in-card row). */
export function QuizBottomBar({ canPrev, canAdvance, isLast, onPrev, onNext, onSubmit }: QuizNavProps) {
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-line pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto flex max-w-[720px] gap-3 px-4">
        <Button variant="ghost" size="lg" className="flex-1 rounded-full border border-line" onClick={onPrev} disabled={!canPrev}>
          <Icon name="arrowLeft" size={18} />
          Previous
        </Button>
        {isLast ? (
          <Button size="lg" className={`flex-[1.6] rounded-full ${NEXT_SHADOW}`} onClick={onSubmit} disabled={!canAdvance}>
            Submit
            <Icon name="check" size={18} strokeWidth={2.5} />
          </Button>
        ) : (
          <Button size="lg" className={`flex-[1.6] rounded-full ${NEXT_SHADOW}`} onClick={onNext} disabled={!canAdvance}>
            Next question
            <Icon name="arrowRight" size={18} strokeWidth={2.5} />
          </Button>
        )}
      </div>
    </div>
  )
}
