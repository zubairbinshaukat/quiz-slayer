import { useId, useState } from 'react'
import { canScanQr, prefersShowingQr, type LinkKind } from '../../lib/linkUi'
import { Button } from '../ui/Button'
import { OtpInput } from '../ui/OtpInput'
import { QrScanner } from './QrScanner'

interface EnterCodeProps {
  /** Which sheet this is (the scanner only accepts QRs meant for it) */
  kind: LinkKind
  /** Pre-filled from a scanned QR: the user still confirms it */
  initialCode?: string
  initialError?: string | null
  /** Under the digits */
  hint: string
  submitLabel: string
  /** Resolves to an error message, or null when done. Never throws. */
  onSubmit: (code: string) => Promise<string | null>
  /** Switch to showing a QR on this device */
  onShowQr: () => void
}

/** Scan the other device's QR, or type its 6-digit code. */
export function EnterCode({ kind, initialCode, initialError = null, hint, submitLabel, onSubmit, onShowQr }: EnterCodeProps) {
  const hintId = useId()
  const [mode, setMode] = useState<'choose' | 'scan' | 'code'>(() =>
    !initialCode && canScanQr && !prefersShowingQr() ? 'choose' : 'code',
  )
  const [code, setCode] = useState(initialCode ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function submit(value: string) {
    if (busy || value.length !== 6) return
    setBusy(true)
    setError(null)
    const message = await onSubmit(value)
    setBusy(false)
    if (message) {
      setError(message)
      setCode('')
      setMode('code')
    }
  }

  const showQr = (
    <Button variant="ghost" className="w-full" onClick={onShowQr}>
      Show a QR on this device instead
    </Button>
  )

  return (
    <div>
      {mode === 'choose' ? (
        <div className="flex flex-col gap-2.5">
          <Button size="lg" className="w-full" onClick={() => setMode('scan')} data-autofocus>Scan QR</Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => setMode('code')}>Enter code instead</Button>
          {showQr}
        </div>
      ) : mode === 'scan' ? (
        <div className="space-y-3">
          <QrScanner kind={kind} onCode={(c) => { setCode(c); setMode('code'); void submit(c) }} />
          <Button variant="ghost" className="w-full" onClick={() => setMode('code')}>Enter code instead</Button>
        </div>
      ) : (
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
            {initialCode ? 'Check this matches the code on your other device.' : hint}
          </p>
          {error && <p role="alert" className="mt-2 text-center text-sm font-semibold text-danger">{error}</p>}
          <div className="mt-4 flex flex-col gap-2">
            <Button size="lg" className="w-full" disabled={busy || code.length !== 6} onClick={() => void submit(code)}>
              {busy ? 'Linking…' : submitLabel}
            </Button>
            {canScanQr && (
              <Button variant="ghost" className="w-full" onClick={() => { setError(null); setMode('scan') }}>
                Scan QR instead
              </Button>
            )}
            {showQr}
          </div>
        </div>
      )}
    </div>
  )
}
