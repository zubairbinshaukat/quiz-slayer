import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { usePlayer } from '../../hooks/usePlayer'
import { discardQueuedAttempts } from '../../lib/attemptSink'
import { convexClient, withTimeout } from '../../lib/convex'
import { getDeviceId } from '../../lib/deviceId'
import { adoptPlayerSecret } from '../../lib/identity'
import { linkUrl } from '../../lib/linkUi'
import { formatClock } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'
import { QrCode } from './QrCode'

type Step =
  | { s: 'creating' }
  | { s: 'confirmReplace' }
  | { s: 'showing'; code: string; expiresAt: number }
  | { s: 'expired' }
  | { s: 'done' }
  | { s: 'error'; message: string }

const POLL_MS = 2000
const OFFLINE = 'Linking needs a connection. Connect and try again.'
const CREATE_ERRORS = {
  rate_limited: 'Too many codes for now. Wait a few minutes and try again.',
  already_linked: 'This device is already linked to another device.',
} as const

/** New device: show a code + QR, wait for the other device to approve, then adopt its player. */
export function JoinSheet({ onClose }: { onClose: () => void }) {
  const createCode = useMutation(api.link.createCode)
  const redeem = useMutation(api.link.redeem)
  const { player } = usePlayer()
  const deviceId = useMemo(() => getDeviceId(), [])
  const [step, setStep] = useState<Step>(() => (navigator.onLine ? { s: 'creating' } : { s: 'error', message: OFFLINE }))
  const [now, setNow] = useState(() => Date.now())
  const request = useRef(0)

  const create = useCallback(
    async (replace: boolean) => {
      const id = ++request.current
      try {
        const res = await withTimeout(createCode({ deviceId, replace }))
        if (id !== request.current) return
        if (res.ok) setStep({ s: 'showing', code: res.code, expiresAt: res.expiresAt })
        else if (res.reason === 'has_progress') setStep({ s: 'confirmReplace' })
        else setStep({ s: 'error', message: CREATE_ERRORS[res.reason] })
      } catch {
        if (id === request.current) setStep({ s: 'error', message: navigator.onLine ? 'Couldn’t reach the server. Try again.' : OFFLINE })
      }
    },
    [createCode, deviceId],
  )

  // Deferred so StrictMode's mount/unmount/mount sends only one request
  useEffect(() => {
    if (!navigator.onLine) return
    const t = window.setTimeout(() => void create(false), 0)
    return () => window.clearTimeout(t)
  }, [create])

  const code = step.s === 'showing' ? step.code : null
  useEffect(() => {
    if (!code || !convexClient) return
    const client = convexClient
    let busy = false
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    const poll = window.setInterval(async () => {
      if (busy || !navigator.onLine) return
      busy = true
      try {
        const res = await withTimeout(client.query(api.link.poll, { deviceId, code }), POLL_MS * 4)
        if (res.status === 'linked') {
          window.clearInterval(poll)
          const { secret } = await withTimeout(redeem({ deviceId, code, handoff: res.handoff }))
          adoptPlayerSecret(secret)
          setStep({ s: 'done' })
        } else if (res.status !== 'pending') {
          window.clearInterval(poll)
          setStep({ s: 'expired' })
        }
      } catch { /* transient: try again next tick */ } finally {
        busy = false
      }
    }, POLL_MS)
    return () => {
      window.clearInterval(tick)
      window.clearInterval(poll)
    }
  }, [code, deviceId, redeem])

  function restart(replace: boolean) {
    setStep({ s: 'creating' })
    void (replace ? discardQueuedAttempts() : Promise.resolve()).then(() => create(replace))
  }

  const title = step.s === 'done' ? 'Linked!' : step.s === 'confirmReplace' ? 'Replace this device’s progress?' : 'Link to your other device'

  return (
    <Sheet open onClose={onClose} title={title}>
      {step.s === 'creating' && <div className="mx-auto h-[300px] max-w-[260px] animate-pulse rounded-card bg-surface-2" aria-label="Creating a code" />}

      {step.s === 'showing' && (
        <div className="flex flex-col items-center text-center">
          <QrCode text={linkUrl(step.code)} size={200} />
          <p className="mt-4 font-mono text-4xl font-bold tracking-[0.18em]" aria-label={`Code ${step.code.split('').join(' ')}`}>
            {step.code.slice(0, 3)} {step.code.slice(3)}
          </p>
          <p className="mt-3 max-w-[36ch] text-sm text-muted">
            On your other device open <span className="font-semibold text-fg">Settings → Devices → Link a new device to this one</span>, then scan the QR or type the code.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted" role="status">
            <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            Waiting for approval · expires in {formatClock(Math.max(0, (step.expiresAt - now) / 1000))}
          </p>
        </div>
      )}

      {step.s === 'confirmReplace' && (
        <div>
          <p className="flex items-start gap-3 rounded-card border border-danger/30 bg-danger/8 p-3.5 text-sm leading-relaxed">
            <Icon name="alert" size={20} className="mt-0.5 shrink-0 text-danger" />
            This device already has its own progress. Linking will replace it with your other device&apos;s progress.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="danger" size="lg" className="w-full" onClick={() => restart(true)}>Replace my progress</Button>
            <Button variant="ghost" className="w-full" onClick={onClose} data-autofocus>Cancel</Button>
          </div>
        </div>
      )}

      {step.s === 'expired' && (
        <div className="text-center">
          <p className="text-sm text-muted">That code expired.</p>
          <Button className="mt-3 w-full" onClick={() => restart(false)}>Get a new code</Button>
        </div>
      )}

      {step.s === 'done' && (
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success" aria-hidden="true">
            <Icon name="check" size={28} strokeWidth={3} />
          </span>
          <p className="mt-3 text-base">
            You’re now playing as <span className="font-semibold">{player?.name ?? '…'}</span> on this device too.
          </p>
          <Button className="mt-4 w-full" onClick={onClose} data-autofocus>Done</Button>
        </div>
      )}

      {step.s === 'error' && (
        <div className="text-center">
          <p role="alert" className="flex items-start justify-center gap-2 text-sm text-muted">
            <Icon name="wifiOff" size={18} className="mt-0.5 shrink-0" />
            {step.message}
          </p>
          <Button variant="secondary" className="mt-3 w-full" onClick={() => restart(false)}>Try again</Button>
        </div>
      )}
    </Sheet>
  )
}
