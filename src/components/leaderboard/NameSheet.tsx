import { useId, useState } from 'react'
import { NAME_MAX, NAME_MIN, NAME_PATTERN, NAME_RULE, normalizeName, type PlayerInfo } from '../../hooks/leaderboardTypes'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'
import { Avatar } from './Avatar'

interface NameSheetProps {
  open: boolean
  /** Current player (generated or chosen name). */
  player: PlayerInfo
  /** Called with the chosen name, or null to keep the generated one. Rejects with a user-facing message. */
  onDone: (name: string | null) => Promise<void> | void
}

/** Pick a display name once, or keep the generated one. Read-only after a name is chosen. */
export function NameSheet({ open, player, onDone }: NameSheetProps) {
  const inputId = useId()
  const hintId = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const clean = normalizeName(value)
  const valid = NAME_PATTERN.test(clean)

  async function finish(name: string | null) {
    setSaving(true)
    setError(null)
    try {
      await onDone(name)
      setValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that name')
    } finally {
      setSaving(false)
    }
  }

  if (player.nameChosen) {
    return (
      <Sheet
        open={open}
        onClose={() => void finish(null)}
        title="Your leaderboard name"
        description="Names are permanent once chosen, so the board stays fair."
        footer={<Button className="w-full" onClick={() => void finish(null)} data-autofocus>Done</Button>}
      >
        <div className="flex items-center gap-3 rounded-card border border-line bg-surface-2 p-3">
          <Avatar name={player.name} size={44} />
          <p className="min-w-0 flex-1 truncate text-base font-semibold">{player.name}</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
            <Icon name="lock" size={14} /> Locked
          </span>
        </div>
      </Sheet>
    )
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
            {saving ? 'Saving…' : 'Use this name'}
          </Button>
          <Button variant="ghost" className="w-full" disabled={saving} onClick={() => void finish(null)}>
            Skip, keep {player.name}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (valid && !saving) void finish(clean)
        }}
      >
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">Display name</label>
        <div className="flex items-center gap-3">
          <Avatar name={clean || player.name} size={44} />
          <input
            id={inputId}
            data-autofocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
            maxLength={NAME_MAX}
            minLength={NAME_MIN}
            autoComplete="nickname"
            enterKeyHint="done"
            placeholder={player.name}
            aria-describedby={hintId}
            aria-invalid={value.length > 0 && !valid}
            className="min-h-12 w-full min-w-0 rounded-btn border border-line bg-surface-2 px-3.5 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <p id={hintId} className="mt-2 text-sm text-muted">
          {NAME_RULE} · {clean.length}/{NAME_MAX}
        </p>
        {error && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{error}</p>}
      </form>
    </Sheet>
  )
}
