import { usePlayer } from '../../hooks/usePlayer'
import { openLinkSheet } from '../../lib/linkUi'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

/** Settings → Devices: link status and the two link entry points (gone once 2 devices are linked). */
export function DevicesSetting({ onNavigate }: { onNavigate: () => void }) {
  const { deviceCount } = usePlayer()
  const full = deviceCount >= 2

  function open(kind: 'approve' | 'join') {
    onNavigate() // close Settings first
    openLinkSheet({ kind })
  }

  return (
    <div className="py-4 first:pt-1 last:pb-1">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Devices</p>
        <span className={full ? 'inline-flex items-center gap-1 text-[13px] font-semibold text-success' : 'text-[13px] font-semibold text-muted'}>
          {full && <Icon name="check" size={14} strokeWidth={3} />}
          {full ? '2 of 2 devices — linked' : '1 of 2 devices'}
        </span>
      </div>
      <p className="mt-0.5 text-[13px] leading-snug text-muted">
        {full
          ? 'Your points and rank are shared by both devices. Linking is permanent.'
          : 'Share your points and rank with one other device. Optional, and it can’t be undone.'}
      </p>
      {!full && (
        <div className="mt-2.5 flex flex-col gap-2">
          <Button variant="secondary" className="w-full justify-start" onClick={() => open('approve')}>
            <Icon name="plus" size={18} />
            Link a new device to this one
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => open('join')}>
            <Icon name="forward" size={18} />
            I’m new here — link my other device
          </Button>
        </div>
      )}
    </div>
  )
}
