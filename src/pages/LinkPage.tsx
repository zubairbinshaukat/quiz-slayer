import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../lib/constants'
import { convexEnabled } from '../lib/convex'
import { linkSheetFromParams, openLinkSheet } from '../lib/linkUi'

/**
 * /link?c=123456 or /link?j=123456 — the URL inside a link QR, opened by the
 * device that scanned it (e.g. with the phone camera): goes home with the
 * matching sheet pre-filled (c: approve that new device, j: join that player).
 */
export function LinkPage() {
  const [params] = useSearchParams()
  const { kind, code } = linkSheetFromParams(params)

  useEffect(() => {
    if (convexEnabled) openLinkSheet(code ? { kind, code } : { kind })
  }, [kind, code])

  return <Navigate to={ROUTES.HOME} replace />
}
