export interface SplitGroup {
  title: string
  rows: { label: string; value: number }[]
}

/** Device / OS / browser split as a plain table with share bars. */
export function SplitTable({ groups, caption }: { groups: SplitGroup[]; caption: string }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <caption className="px-4 pt-3.5 pb-1 text-left text-sm font-semibold">{caption}</caption>
        {groups.map((g) => {
          const sum = g.rows.reduce((s, r) => s + r.value, 0)
          return (
            <tbody key={g.title} className="border-t border-line first-of-type:border-t-0">
              <tr>
                <th colSpan={3} scope="colgroup" className="px-4 pt-3 pb-1 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {g.title}
                </th>
              </tr>
              {g.rows.map((r) => {
                const pct = sum > 0 ? Math.round((r.value / sum) * 100) : 0
                return (
                  <tr key={r.label}>
                    <th scope="row" className="w-28 px-4 py-1.5 text-left font-medium">{r.label}</th>
                    <td className="py-1.5">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="w-24 px-4 py-1.5 text-right font-mono text-xs text-muted">
                      {r.value} · {pct}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          )
        })}
      </table>
    </div>
  )
}
