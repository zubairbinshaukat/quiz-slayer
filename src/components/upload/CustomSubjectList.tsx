import { useState } from 'react'
import { Button } from '../ui/Button'
import type { Subject } from '../../types'

interface CustomSubjectListProps {
  subjects: Subject[]
  onRemove: (slug: string) => Promise<void>
  error: string | null
}

export function CustomSubjectList({ subjects, onRemove, error }: CustomSubjectListProps) {
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null)
  const [removingSlug, setRemovingSlug] = useState<string | null>(null)

  async function remove(slug: string) {
    setRemovingSlug(slug)
    try {
      await onRemove(slug)
      setConfirmSlug(null)
    } finally {
      setRemovingSlug(null)
    }
  }

  return (
    <section className="card p-4 sm:p-5" aria-labelledby="custom-heading">
      <h2 id="custom-heading" className="text-lg">Your added subjects</h2>
      {error && <p role="alert" className="mt-3 rounded-btn bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {subjects.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No custom subjects yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {subjects.map((s) => (
            <li key={s.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.subject}</p>
                <p className="text-sm text-muted">
                  {s.questionCount} question{s.questionCount !== 1 ? 's' : ''}
                  {s.guessQuestions.length > 0 ? ` · ${s.guessQuestions.length} AI practice` : ''}
                  <span className="font-mono text-xs"> · {s.slug}</span>
                </p>
              </div>
              {confirmSlug === s.slug ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="min-h-11" onClick={() => setConfirmSlug(null)} disabled={removingSlug === s.slug}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="danger" className="min-h-11" onClick={() => void remove(s.slug)} disabled={removingSlug === s.slug}>
                    {removingSlug === s.slug ? 'Removing…' : 'Yes, remove'}
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="danger" className="min-h-11" onClick={() => setConfirmSlug(s.slug)} disabled={!!removingSlug}>
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
