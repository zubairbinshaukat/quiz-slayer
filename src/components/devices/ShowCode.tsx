import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { discardQueuedAttempts } from '../../lib/attemptSink'
import { linkUrl, type LinkKind } from '../../lib/linkUi'
import { formatClock } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { QrCode } from './QrCode'

export type CreateResult = { ok: true; code: string; expiresAt: number } | { ok: false; reason: string }
/** 'gone' = expired or replaced */
export type CheckResult = 'pending' | 'linked' | 'gone'

type Step =
  | { s: 'creating' }
  | { s: 'confirmReplace' }
  | { s: 'showing'; code: string; expiresAt: number }
  | { s: 'expired' }
  | { s: 'error'; message: string }

const POLL_MS = 2000
export const LINK_OFFLINE = 'Linking needs a connection. Connect and try again.'
export const LINK_NETWORK = 'Couldn’t reach the server. Try again.'

interface ShowCodeProps {
  /** Creates the code; `replace` = the user agreed to drop this device's own progress. Throws on network errors. */
  create: (replace: boolean) => Promise<CreateResult>
  /** Polled while the code is shown. Throws on transient errors (retried next tick). */
  check: (code: string) => Promise<CheckResult>
  /** Text per failed `create` reason */
  errors: Record<string, string>
  /** The sheet the QR opens on the device that scans it */
  opens: LinkKind
  /** Instruction under the code */
  children: ReactNode
  onLinked: () => void
  onCancel: () => void
}

/** Shows a 6-digit code + QR for the other device, and waits until it's used. */
export function ShowCode({ create, check, errors, opens, children, onLinked, onCancel }: ShowCodeProps) {
  const [step, setStep] = useState<Step>(() => (navigator.onLine ? { s: 'creating' } : { s: 'error', message: LINK_OFFLINE }))
  const [now, setNow] = useState(() => Date.now())
  const request = useRef(0)
  const latest = useRef({ create, check, errors, onLinked })
  useEffect(() => {
    latest.current = { create, check, errors, onLinked }
  })

  const start = useCallback(async (replace: boolean) => {
    const id = ++request.current
    try {
      const res = await latest.current.create(replace)
      if (id !== request.current) return
      if (res.ok) setStep({ s: 'showing', code: res.code, expiresAt: res.expiresAt })
      else if (res.reason === 'has_progress') setStep({ s: 'confirmReplace' })
      else setStep({ s: 'error', message: latest.current.errors[res.reason] ?? LINK_NETWORK })
    } catch {
      if (id === request.current) setStep({ s: 'error', message: navigator.onLine ? LINK_NETWORK : LINK_OFFLINE })
    }
  }, [])

  // Deferred so StrictMode's mount/unmount/mount sends only one request
  useEffect(() => {
    if (!navigator.onLine) return
    const t = window.setTimeout(() => void start(false), 0)
    return () => window.clearTimeout(t)
  }, [start])

  const code = step.s === 'showing' ? step.code : null
  useEffect(() => {
    if (!code) return
    let busy = false
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    const poll = window.setInterval(async () => {
      if (busy || !navigator.onLine) return
      busy = true
      try {
        const res = await latest.current.check(code)
        if (res === 'linked') {
          window.clearInterval(poll)
          latest.current.onLinked()
        } else if (res === 'gone') {
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
  }, [code])

  function restart(replace: boolean) {
    setStep({ s: 'creating' })
    void (replace ? discardQueuedAttempts() : Promise.resolve()).then(() => start(replace))
  }

  switch (step.s) {
    case 'creating':
      return <div className="mx-auto h-[300px] max-w-[260px] animate-pulse rounded-card bg-surface-2" aria-label="Creating a code" />

    case 'showing':
      return (
        <div className="flex flex-col items-center text-center">
          <QrCode text={linkUrl(step.code, opens)} size={200} />
          <p className="mt-4 font-mono text-4xl font-bold tracking-[0.18em]" aria-label={`Code ${step.code.split('').join(' ')}`}>
            {step.code.slice(0, 3)} {step.code.slice(3)}
          </p>
          <p className="mt-3 max-w-[36ch] text-sm text-muted">{children}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted" role="status">
            <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            Waiting for your other device · expires in {formatClock(Math.max(0, (step.expiresAt - now) / 1000))}
          </p>
        </div>
      )

    case 'confirmReplace':
      return <ReplaceProgress onReplace={() => restart(true)} onCancel={onCancel} />

    case 'expired':
      return (
        <div className="text-center">
          <p className="text-sm text-muted">That code expired.</p>
          <Button className="mt-3 w-full" onClick={() => restart(false)}>Get a new code</Button>
        </div>
      )

    case 'error':
      return (
        <div className="text-center">
          <p role="alert" className="flex items-start justify-center gap-2 text-sm text-muted">
            <Icon name="wifiOff" size={18} className="mt-0.5 shrink-0" />
            {step.message}
          </p>
          <Button variant="secondary" className="mt-3 w-full" onClick={() => restart(false)}>Try again</Button>
        </div>
      )
  }
}

/** New device with its own progress: confirm that linking replaces it. */
export function ReplaceProgress({ onReplace, onCancel, busy }: { onReplace: () => void; onCancel: () => void; busy?: boolean }) {
  return (
    <div>
      <div className="flex items-start gap-3 rounded-card border border-danger/30 bg-danger/8 p-3.5 text-sm leading-relaxed">
        <Icon name="alert" size={20} className="mt-0.5 shrink-0 text-danger" />
        <p>
          <span className="block font-semibold">Replace this device’s progress?</span>
          This device already has its own progress. Linking will replace it with your other device&apos;s progress.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="danger" size="lg" className="w-full" disabled={busy} onClick={onReplace}>
          {busy ? 'Linking…' : 'Replace my progress'}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onCancel} data-autofocus>Cancel</Button>
      </div>
    </div>
  )
}
