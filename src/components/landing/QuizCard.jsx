export function QuizCard({ subject, questionCount, description, onStart }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl border cursor-pointer overflow-hidden bg-surface-primary transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 border-themed-border hover:border-themed-accent/50"
      onClick={onStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onStart()}
      aria-label={`Start ${subject} quiz`}
    >
      {/* Accent top bar */}
      <div className="h-1 bg-gradient-to-r from-themed-accent to-violet-500" />

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Quiz icon + badge row */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-themed-accent/10 flex items-center justify-center text-lg">
            📝
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-themed-accent bg-themed-accent/8 px-2 py-0.5 rounded-full">
            Quiz
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-extrabold text-content-primary leading-snug mb-1">
          {subject}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-content-secondary line-clamp-2 mb-auto">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-black/5 dark:border-white/8">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-content-secondary">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
            </svg>
            {questionCount} Qs
          </span>

          <span className="text-xs font-extrabold text-themed-accent flex items-center gap-0.5 transition-transform duration-300 group-hover:translate-x-1">
            Take Quiz
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
