import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { usePlayer } from '../../hooks/usePlayer'
import { convexClient, withTimeout } from '../../lib/convex'
import { ensurePlayer } from '../../lib/identity'
import { prefersShowingQr } from '../../lib/linkUi'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'
import { EnterCode } from './EnterCode'
import { LINK_NETWORK, LINK_OFFLINE, ShowCode, type CheckResult, type CreateResult } from './ShowCode'

const APPROVE_ERRORS = {
  invalid: 'That code didn’t match. Check the digits on your other device.',
  expired: 'That code has expired. Get a new one on your other device.',
  full: 'You already have 2 devices linked. That’s the limit.',
  self: 'That device is already linked to you.',
  has_progress: 'That device has its own progress. On it, accept replacing its progress, then try a new code.',
  rate_limited: 'Too many wrong codes. Try again in 15 minutes.',
  no_player: 'Couldn’t set up your player. Try again.',
} as const

const INVITE_ERRORS: Record<string, string> = {
  full: APPROVE_ERRORS.full,
  no_player: APPROVE_ERRORS.no_player,
  rate_limited: 'Too many codes for now. Wait a few minutes and try again.',
}

async function requireSecret(): Promise<string> {
  const secret = await ensurePlayer()
  if (!secret) throw new Error('No connection')
  return secret
}

/**
 * Existing device links a new one. Laptops show an invite QR for the new device
 * to scan; phones scan (or type) the code shown on the new device.
 */
export function ApproveSheet({ initialCode, onClose }: { initialCode?: string; onClose: () => void }) {
  const approve = useMutation(api.link.approve)
  const createInvite = useMutation(api.link.createInvite)
  const { deviceCount } = usePlayer()
  const [showing, setShowing] = useState(() => !initialCode && prefersShowingQr())
  const [done, setDone] = useState(false)

  async function submit(code: string): Promise<string | null> {
    try {
      if (!navigator.onLine) return LINK_OFFLINE
      const secret = await ensurePlayer()
      if (!secret) return LINK_NETWORK
      const res = await withTimeout(approve({ secret, code }))
      if (!res.ok) return APPROVE_ERRORS[res.reason]
      setDone(true)
      return null
    } catch {
      return LINK_NETWORK
    }
  }

  async function create(): Promise<CreateResult> {
    return await withTimeout(createInvite({ secret: await requireSecret() }))
  }

  async function check(code: string): Promise<CheckResult> {
    if (!convexClient) throw new Error('Convex is off')
    const res = await withTimeout(convexClient.query(api.link.inviteStatus, { secret: await requireSecret(), code }))
    return res.status === 'linked' ? 'linked' : res.status === 'pending' ? 'pending' : 'gone'
  }

  if (done) {
    return (
      <Sheet open onClose={onClose} title="Linked!" footer={<Button className="w-full" onClick={onClose} data-autofocus>Done</Button>}>
        <div className="flex items-start gap-3 rounded-card border border-success/30 bg-success/8 p-3.5 text-sm">
          <Icon name="check" size={20} strokeWidth={3} className="mt-0.5 shrink-0 text-success" />
          <p>Your other device now shares your points and rank. You have 2 of 2 devices.</p>
        </div>
      </Sheet>
    )
  }

  // While an invite is shown, the count turns 2 as soon as it's claimed: let the poll finish into "Linked!"
  const full = deviceCount >= 2 && !showing
  return (
    <Sheet
      open
      onClose={onClose}
      title="Link a new device"
      description={full || showing ? undefined : 'On the new device, open Settings → Devices → “I’m new here” to show a code.'}
    >
      {full ? (
        <p className="card p-3.5 text-sm text-muted">You already have 2 of 2 devices linked. Devices can’t be unlinked.</p>
      ) : showing ? (
        <div>
          <ShowCode create={create} check={check} errors={INVITE_ERRORS} opens="join" onLinked={() => setDone(true)} onCancel={onClose}>
            Scan this QR with the new device’s camera, or type the code there in{' '}
            <span className="font-semibold text-fg">Settings → Devices → I’m new here</span>.
          </ShowCode>
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowing(false)}>
            Scan or type the new device’s code instead
          </Button>
        </div>
      ) : (
        <EnterCode
          kind="approve"
          initialCode={initialCode}
          hint="Type the code shown on your new device."
          submitLabel="Link this device"
          onSubmit={submit}
          onShowQr={() => setShowing(true)}
        />
      )}
    </Sheet>
  )
}
