import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNav } from '../../hooks/useNav'
import { setAdminToken } from '../../lib/admin'
import { withTimeout } from '../../lib/convex'
import { getDeviceId } from '../../lib/deviceId'
import { OtpInput } from '../ui/OtpInput'
import { Sheet } from '../ui/Sheet'

const MESSAGES = {
  wrong: 'Wrong PIN.',
  locked: 'Too many attempts. Try again in 15 minutes.',
  network: 'Couldn’t reach the server.',
} as const

/** Owner PIN prompt (opened by 7 quick taps on the logo). Convex builds only. */
export function AdminPinSheet({ onClose }: { onClose: () => void }) {
  const nav = useNav()
  const login = useMutation(api.admin.login)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<keyof typeof MESSAGES | null>(null)

  async function submit(value: string) {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await withTimeout(login({ deviceId: getDeviceId(), pin: value }))
      if (res.ok) {
        setAdminToken(res.token)
        onClose()
        nav('/stats')
        return
      }
      setError(res.reason)
    } catch {
      setError('network')
    }
    setPin('')
    setBusy(false)
  }

  return (
    <Sheet open onClose={onClose} title="Enter PIN">
      <OtpInput
        label="6-digit PIN"
        value={pin}
        onChange={(v) => {
          setPin(v)
          setError(null)
        }}
        onComplete={(v) => void submit(v)}
        mask
        autoComplete="off"
        autoFocus
        // Not disabled while checking: a disabled input drops focus (and the mobile keyboard)
        disabled={error === 'locked'}
        invalid={!!error}
      />
      <p role="status" className="mt-3 min-h-5 text-center text-sm font-semibold text-danger">
        {error ? MESSAGES[error] : ''}
      </p>
    </Sheet>
  )
}
