import { Icon3D } from '../ui/Icon3D'

/** Landing header: brand eyebrow + greeting (the page's h1) and the streak chip. */
export function GreetingRow({ streak }: { streak: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h1 className="min-w-0">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Quiz Slayer</span>
        <span className="block text-[32px] leading-none sm:text-4xl">Ready to slay?</span>
      </h1>
      <div
        className="card mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3"
        aria-label={streak > 0 ? `${streak} day streak` : 'No active streak'}
      >
        <Icon3D name="fire" size={26} eager />
        <span className="text-sm font-bold">{streak}</span>
        <span className="text-xs text-muted">{streak === 1 ? 'day' : 'days'}</span>
      </div>
    </div>
  )
}
