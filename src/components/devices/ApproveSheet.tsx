import { useId, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { usePlayer } from '../../hooks/usePlayer'
import { withTimeout } from '../../lib/convex'
import { ensurePlayer } from '../../lib/identity'
import { canScanQr } from '../../lib/linkUi'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { OtpInput } from '../ui/OtpInput'
import { Sheet } from '../ui/Sheet'
import { QrScanner } from './QrScanner'

type ApproveFailure = 'no_player' | 'full' | 'rate_limited' | 'invalid' | 'expired' | 'self' | 'has_progress'

const FAILURE_TEXT: Record<ApproveFailure | 'offline' | 'network', string> = {
  invalid: 'That code didn’t match. Check the digits on your other device.',
  expired: 'That code has expired. Get a new one on your other device.',
  full: 'You already have 2 devices linked. That’s the limit.',
  self: 'That device is already linked to you.',
  has_progress: 'That device has its own progress. On it, accept replacing its progress, then try a new code.',
  rate_limited: 'Too many wrong codes. Try again in 15 minutes.',
  no_player: 'Couldn’t set up your player. Try again.',
  offline: 'Linking needs a connection. Connect and try again.',
  network: 'Couldn’t reach the server. Try again.',
}

/** Existing device: approve the 6-digit code shown on the new device (scan or type it). */
export function ApproveSheet({ initialCode, onClose }: { initialCode?: string; onClose: () => void }) {
  const hintId = useId()
  const approve = useMutation(api.link.approve)
  const { deviceCount } = usePlayer()
  const [mode, setMode] = useState<'choose' | 'scan' | 'code'>(initialCode ? 'code' : 'choose')
  const [code, setCode] = useState(initialCode ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(value: string) {
    if (busy || value.length !== 6) return
    setBusy(true)
    setError(null)
    try {
      if (!navigator.onLine) throw new Error(FAILURE_TEXT.offline)
      const secret = await ensurePlayer()
      if (!secret) throw new Error(FAILURE_TEXT.network)
      const res = await withTimeout(approve({ secret, code: value }))
      if (res.ok) setDone(true)
      else {
        setError(FAILURE_TEXT[res.reason])
        setCode('')
        if (mode === 'scan') setMode('code')
      }
    } catch (err) {
      const known: string[] = Object.values(FAILURE_TEXT)
      setError(err instanceof Error && known.includes(err.message) ? err.message : FAILURE_TEXT.network)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Sheet open onClose={onClose} title="Linked!" footer={<Button className="w-full" onClick={onClose} data-autofocus>Done</Button>}>
        <div className="flex items-start gap-3 rounded-card border border-success/30 bg-success/8 p-3.5 text-sm">
          <Icon name="check" size={20} strokeWidth={3} className="mt-0.5 shrink-0 text-success" />
          <p>Your other device will switch to your progress in a moment. You now have 2 of 2 devices.</p>
        </div>
      </Sheet>
    )
  }

  const full = deviceCount >= 2
  return (
    <Sheet
      open
      onClose={onClose}
      title="Link a new device"
      description="On the new device, open Settings → Devices → “I’m new here” to show a code."
      footer={
        mode === 'code' && !full ? (
          <Button size="lg" className="w-full" disabled={busy || code.length !== 6} onClick={() => void submit(code)}>
            {busy ? 'Linking…' : 'Link this device'}
          </Button>
        ) : undefined
      }
    >
      {full ? (
        <p className="card p-3.5 text-sm text-muted">You already have 2 of 2 devices linked. Devices can’t be unlinked.</p>
      ) : mode === 'scan' ? (
        <div className="space-y-3">
          <QrScanner onCode={(c) => { setCode(c); setMode('code'); void submit(c) }} />
          <Button variant="ghost" className="w-full" onClick={() => setMode('code')}>Enter code instead</Button>
        </div>
      ) : mode === 'code' ? (
        <div>
          <OtpInput
            label="6-digit link code"
            value={code}
            onChange={(v) => { setCode(v); setError(null) }}
            onComplete={(v) => { if (v !== initialCode) void submit(v) }}
            disabled={busy}
            invalid={!!error}
            autoFocus={!initialCode}
            describedBy={hintId}
          />
          <p id={hintId} className="mt-3 text-center text-sm text-muted">
            {initialCode ? 'Check this matches the code on your new device.' : 'Type the code shown on your new device.'}
          </p>
          {canScanQr && (
            <Button variant="ghost" className="mt-2 w-full" onClick={() => { setError(null); setMode('scan') }}>
              Scan QR instead
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {canScanQr && (
            <Button size="lg" className="w-full" onClick={() => setMode('scan')} data-autofocus>Scan QR</Button>
          )}
          <Button size="lg" variant={canScanQr ? 'secondary' : 'primary'} className="w-full" onClick={() => setMode('code')}>
            {canScanQr ? 'Enter code instead' : 'Enter code'}
          </Button>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-center text-sm font-semibold text-danger">{error}</p>}
    </Sheet>
  )
}
