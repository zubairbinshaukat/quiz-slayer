import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { openLinkSheet, parseLinkPayload } from '../lib/linkUi'

/**
 * /link?c=123456 — the URL inside the link QR. Opened on the existing device
 * (e.g. scanned with the phone camera): goes home with the approve sheet pre-filled.
 */
export function LinkPage() {
  const [params] = useSearchParams()
  const code = parseLinkPayload(params.get('c') ?? '')

  useEffect(() => {
    if (convexEnabled) openLinkSheet(code ? { kind: 'approve', code } : { kind: 'approve' })
  }, [code])

  return <Navigate to={ROUTES.HOME} replace />
}
