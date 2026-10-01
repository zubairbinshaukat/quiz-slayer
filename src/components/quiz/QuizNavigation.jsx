import { Button } from '../ui/Button'

export function QuizNavigation({
  currentIndex,
  total,
  selectedIndex,
  isLastQuestion,
  onPrev,
  onNext,
  onSubmit,
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-themed-border">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={currentIndex === 0}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </Button>

      {/* Dot indicators (up to 10) */}
      {total <= 12 && (
        <div className="hidden sm:flex items-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? 'bg-themed-accent w-4'
                  : 'bg-themed-border'
              }`}
            />
          ))}
        </div>
      )}

      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          disabled={selectedIndex === null}
          variant="primary"
        >
          Submit Quiz
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      ) : (
        <Button onClick={onNext} disabled={selectedIndex === null}>
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      )}
    </div>
  )
}
