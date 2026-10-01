import type { PlayerInfo } from '../../hooks/leaderboardTypes'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Avatar } from './Avatar'

/** "Playing as" strip: choose a name once, then it shows as locked. */
export function PlayerNameRow({ player, onEdit }: { player: PlayerInfo; onEdit: () => void }) {
  return (
    <div className="card mb-5 flex items-center gap-3 py-2 pr-2 pl-3">
      <Avatar name={player.name} size={32} />
      <p className="min-w-0 flex-1 text-sm">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">Playing as</span>
        <span className="block truncate font-semibold">{player.name}</span>
      </p>
      {player.nameChosen ? (
        <button
          type="button"
          onClick={onEdit}
          className="press inline-flex min-h-11 items-center gap-1.5 rounded-btn px-3 text-xs font-semibold text-muted hover:bg-surface-2"
          aria-label={`Name ${player.name} is locked`}
        >
          <Icon name="lock" size={14} /> Locked
        </button>
      ) : (
        <Button variant="secondary" size="sm" onClick={onEdit}>Choose name</Button>
      )}
    </div>
  )
}
