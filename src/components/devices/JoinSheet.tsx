import { useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { usePlayer } from '../../hooks/usePlayer'
import { discardQueuedAttempts } from '../../lib/attemptSink'
import { convexClient, withTimeout } from '../../lib/convex'
import { getDeviceId } from '../../lib/deviceId'
import { adoptPlayerSecret } from '../../lib/identity'
import { prefersShowingQr } from '../../lib/linkUi'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'
import { EnterCode } from './EnterCode'
import { LINK_NETWORK, LINK_OFFLINE, ReplaceProgress, ShowCode, type CheckResult, type CreateResult } from './ShowCode'

const POLL_TIMEOUT_MS = 8000

const CODE_ERRORS: Record<string, string> = {
  rate_limited: 'Too many codes for now. Wait a few minutes and try again.',
  already_linked: 'This device is already linked to another device.',
}

const CLAIM_ERRORS = {
  invalid: 'That code didn’t match. Check the digits on your other device.',
  expired: 'That code has expired. Show a new one on your other device.',
  full: 'Your other device already has 2 devices linked. That’s the limit.',
  self: 'This device is already linked to your other device.',
  already_linked: CODE_ERRORS.already_linked,
  rate_limited: 'Too many wrong codes. Try again in 15 minutes.',
} as const

/**
 * New device joins an existing one, then adopts its player. Laptops show a code
 * QR for the other device to scan; phones scan (or type) the invite shown on the other device.
 */
export function JoinSheet({ initialCode, onClose }: { initialCode?: string; onClose: () => void }) {
  const createCode = useMutation(api.link.createCode)
  const redeem = useMutation(api.link.redeem)
  const claimInvite = useMutation(api.link.claimInvite)
  const { player } = usePlayer()
  const deviceId = useMemo(() => getDeviceId(), [])
  const [showing, setShowing] = useState(() => !initialCode && prefersShowingQr())
  const [replaceCode, setReplaceCode] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function claim(code: string, replace = false): Promise<string | null> {
    try {
      if (!navigator.onLine) return LINK_OFFLINE
      if (replace) await discardQueuedAttempts()
      const res = await withTimeout(claimInvite({ deviceId, code, replace }))
      if (res.ok) {
        adoptPlayerSecret(res.secret)
        setDone(true)
      } else if (res.reason === 'has_progress') {
        setReplaceCode(code)
      } else {
        return CLAIM_ERRORS[res.reason]
      }
      return null
    } catch {
      return LINK_NETWORK
    }
  }

  async function confirmReplace(code: string) {
    setReplacing(true)
    const message = await claim(code, true)
    setReplacing(false)
    if (message) {
      setClaimError(message)
      setReplaceCode(null)
    }
  }

  async function create(replace: boolean): Promise<CreateResult> {
    return await withTimeout(createCode({ deviceId, replace }))
  }

  async function check(code: string): Promise<CheckResult> {
    if (!convexClient) throw new Error('Convex is off')
    const res = await withTimeout(convexClient.query(api.link.poll, { deviceId, code }), POLL_TIMEOUT_MS)
    if (res.status === 'linked') {
      const { secret } = await withTimeout(redeem({ deviceId, code, handoff: res.handoff }))
      adoptPlayerSecret(secret)
      return 'linked'
    }
    return res.status === 'pending' ? 'pending' : 'gone'
  }

  if (done) {
    return (
      <Sheet open onClose={onClose} title="Linked!">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success" aria-hidden="true">
            <Icon name="check" size={28} strokeWidth={3} />
          </span>
          <p className="mt-3 text-base">
            You’re now playing as <span className="font-semibold">{player?.name ?? '…'}</span> on this device too.
          </p>
          <Button className="mt-4 w-full" onClick={onClose} data-autofocus>Done</Button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Link to your other device"
      description={
        showing || replaceCode || initialCode
          ? undefined
          : 'On the device you already play on, open Settings → Devices → “Link a new device to this one” to show a QR.'
      }
    >
      {replaceCode ? (
        <ReplaceProgress busy={replacing} onReplace={() => void confirmReplace(replaceCode)} onCancel={onClose} />
      ) : showing ? (
        <div>
          <ShowCode create={create} check={check} errors={CODE_ERRORS} opens="approve" onLinked={() => setDone(true)} onCancel={onClose}>
            On your other device open <span className="font-semibold text-fg">Settings → Devices → Link a new device to this one</span>,
            then scan this QR or type the code.
          </ShowCode>
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowing(false)}>
            Scan or type my other device’s code instead
          </Button>
        </div>
      ) : (
        <EnterCode
          key={claimError ?? 'enter'}
          kind="join"
          initialCode={initialCode}
          initialError={claimError}
          hint="Type the code shown on your other device."
          submitLabel="Link this device"
          onSubmit={(code) => claim(code)}
          onShowQr={() => setShowing(true)}
        />
      )}
    </Sheet>
  )
}
