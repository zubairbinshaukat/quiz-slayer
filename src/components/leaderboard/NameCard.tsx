import { useEffect, useId, useState } from 'react'
import { NAME_MAX, NAME_MIN, NAME_PATTERN, NAME_RULE, normalizeName, type PlayerInfo } from '../../hooks/leaderboardTypes'
import { haptic } from '../../lib/haptics'
import { Button } from '../ui/Button'
import { Avatar } from './Avatar'

interface NameCardProps {
  player: PlayerInfo
  /** Rejects with a user-facing message (taken / invalid / offline). */
  onChoose: (name: string) => Promise<void>
  /** Keep the random name for now (hidden for the rest of this session). */
  onKeep: () => void
}

/** Inline "choose your name" card at the top of the leaderboard, shown on every visit until a name is chosen. */
export function NameCard({ player, onChoose, onKeep }: NameCardProps) {
  const inputId = useId()
  const hintId = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const clean = normalizeName(value)
  const valid = NAME_PATTERN.test(clean)

  // Attention nudge on arrival (the shake itself is CSS: .attn-shake)
  useEffect(() => {
    haptic('tap')
  }, [])

  async function submit() {
    if (!valid || saving) return
    setSaving(true)
    setError(null)
    try {
      await onChoose(clean)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that name')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card attn-shake relative overflow-hidden border-accent/40 p-5" aria-labelledby={`${inputId}-title`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_180px_at_0%_0%,rgb(245_183_58/0.14),transparent_70%)]" />
      <div className="relative flex items-center gap-4">
        <Avatar name={clean || player.name} size={52} ring="var(--color-accent)" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Leaderboard name</p>
          <h2 id={`${inputId}-title`} className="text-lg font-bold">Choose your name</h2>
          <p className="truncate text-[13px] text-muted">
            Random name: <span className="font-semibold text-fg">{player.name}</span>
          </p>
        </div>
      </div>
      <form
        className="relative mt-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label htmlFor={inputId} className="sr-only">Display name</label>
        <input
          id={inputId}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          maxLength={NAME_MAX}
          minLength={NAME_MIN}
          autoComplete="nickname"
          enterKeyHint="done"
          placeholder="Type a name…"
          aria-describedby={hintId}
          aria-invalid={value.length > 0 && !valid}
          className="min-h-12 w-full rounded-btn border border-line bg-surface-2 px-3.5 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <p id={hintId} className="mt-2 text-[13px] text-muted">
          {NAME_RULE} · {clean.length}/{NAME_MAX}. You can only set it once.
        </p>
        {error && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{error}</p>}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="sm:flex-1" disabled={!valid || saving}>
            {saving ? 'Saving…' : 'Use this name'}
          </Button>
          <Button variant="outline" className="sm:flex-1" disabled={saving} onClick={onKeep}>
            Keep random name
          </Button>
        </div>
      </form>
    </section>
  )
}
