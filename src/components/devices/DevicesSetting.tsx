import { usePlayer } from '../../hooks/usePlayer'
import { openLinkSheet } from '../../lib/linkUi'
import { cn } from '../../lib/utils'
import { Icon, type IconName } from '../ui/Icon'

function LinkRow({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-surface-3"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-3 text-fg" aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      <Icon name="forward" size={18} className="shrink-0 text-muted" />
    </button>
  )
}

/** Settings → Devices: link status and the two link entry points (gone once 2 devices are linked). */
export function DevicesSetting({ onNavigate }: { onNavigate: () => void }) {
  const { deviceCount } = usePlayer()
  const full = deviceCount >= 2

  function open(kind: 'approve' | 'join') {
    onNavigate() // close Settings first
    openLinkSheet({ kind })
  }

  return (
    <>
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold">Linked devices</p>
          <span className={cn('inline-flex items-center gap-1 text-[13px] font-semibold', full ? 'text-success' : 'text-muted')}>
            {full && <Icon name="check" size={14} strokeWidth={3} />}
            {full ? '2 of 2 — linked' : '1 of 2'}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">
          {full
            ? 'Your points and rank are shared by both devices. Linking is permanent.'
            : 'Share your points and rank with one other device. Optional, and it can’t be undone.'}
        </p>
      </div>
      {!full && (
        <>
          <LinkRow icon="plus" label="Link a new device to this one" onClick={() => open('approve')} />
          <LinkRow icon="refresh" label="I’m new here — link my other device" onClick={() => open('join')} />
        </>
      )}
    </>
  )
}
