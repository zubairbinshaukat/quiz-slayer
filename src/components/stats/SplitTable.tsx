export interface SplitGroup {
  title: string
  rows: { label: string; value: number }[]
}

function SplitCard({ group }: { group: SplitGroup }) {
  const sum = group.rows.reduce((s, r) => s + r.value, 0)
  const seen = group.rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value)
  const unseen = group.rows.filter((r) => r.value === 0)

  return (
    <section className="card flex flex-col p-4">
      <h3 className="eyebrow">{group.title}</h3>
      {seen.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-3.5">
          {seen.map((r) => {
            const pct = Math.round((r.value / sum) * 100)
            return (
              <li key={r.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{r.label}</span>
                  <span className="shrink-0 font-mono text-sm">
                    <span className="font-bold">{pct}%</span>
                    <span className="ml-1.5 text-xs text-muted">{r.value}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {unseen.length > 0 && (
        <p className="mt-auto pt-4 text-xs text-muted">Not seen: {unseen.map((r) => r.label).join(', ')}</p>
      )}
    </section>
  )
}

/** Device / OS / browser split: one card per group, biggest share first, zero rows folded into a footnote. */
export function SplitTable({ groups, caption, note }: { groups: SplitGroup[]; caption: string; note?: string }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-base font-bold tracking-[-0.01em]">{caption}</h2>
        {note && <p className="text-xs text-muted">{note}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {groups.map((g) => <SplitCard key={g.title} group={g} />)}
      </div>
    </div>
  )
}
