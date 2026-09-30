import { useId, useMemo, useState } from 'react'
import { NAME_MAX, NAME_MIN } from '../../hooks/leaderboardTypes'
import { getDeviceId } from '../../lib/deviceId'
import { previewRandomName } from '../../lib/randomName'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { Avatar } from './Avatar'

interface NameSheetProps {
  open: boolean
  /** Called with the chosen name, or null to stay anonymous. */
  onDone: (name: string | null) => Promise<void> | void
}

/** First-visit prompt: pick a display name or keep the generated one. */
export function NameSheet({ open, onDone }: NameSheetProps) {
  const inputId = useId()
  const hintId = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const preview = useMemo(() => previewRandomName(getDeviceId()), [])

  const clean = value.trim().replace(/\s+/g, ' ')
  const valid = clean.length >= NAME_MIN && clean.length <= NAME_MAX

  async function finish(name: string | null) {
    setSaving(true)
    setError(null)
    try {
      await onDone(name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that name')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => void finish(null)}
      title="Pick your leaderboard name"
      description="Shown next to your points. You can only set it once."
      footer={
        <div className="flex flex-col gap-2">
          <Button size="lg" className="w-full" disabled={!valid || saving} onClick={() => void finish(clean)}>
            Use this name
          </Button>
          <Button variant="ghost" className="w-full" disabled={saving} onClick={() => void finish(null)}>
            Skip, stay anonymous
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) void finish(clean)
        }}
      >
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">Display name</label>
        <div className="flex items-center gap-3">
          <Avatar name={clean || preview} size={44} />
          <input
            id={inputId}
            data-autofocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={NAME_MAX}
            minLength={NAME_MIN}
            autoComplete="nickname"
            enterKeyHint="done"
            placeholder={preview}
            aria-describedby={hintId}
            aria-invalid={value.length > 0 && !valid}
            className="min-h-12 w-full min-w-0 rounded-btn border border-line bg-surface-2 px-3.5 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <p id={hintId} className="mt-2 text-sm text-muted">
          {NAME_MIN}–{NAME_MAX} characters · {clean.length}/{NAME_MAX}
        </p>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      </form>

      <div className="mt-5 rounded-card border border-line bg-surface-2 p-3 text-sm">
        <p className="text-muted">Skip and you'll appear as</p>
        <p className="mt-1 flex items-center gap-2 font-semibold">
          <Avatar name={preview} size={28} />
          {preview}
        </p>
      </div>
    </Sheet>
  )
}
