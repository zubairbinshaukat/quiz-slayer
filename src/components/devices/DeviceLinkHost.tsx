import { lazy, Suspense } from 'react'
import { closeLinkSheet, useLinkSheet } from '../../lib/linkUi'

// The sheets (QR, scanner, OTP) are only needed once someone links a device: keep them out of the main bundle
const JoinSheet = lazy(() => import('./JoinSheet').then((m) => ({ default: m.JoinSheet })))
const ApproveSheet = lazy(() => import('./ApproveSheet').then((m) => ({ default: m.ApproveSheet })))

/** Renders whichever device-link sheet is open. Mounted once in the app shell (Convex builds only). */
export function DeviceLinkHost() {
  const sheet = useLinkSheet()
  if (!sheet) return null
  // Mounted fresh per open so each flow starts from a clean state
  return (
    <Suspense fallback={null}>
      {sheet.kind === 'join' ? (
        <JoinSheet key={sheet.code ?? 'manual'} initialCode={sheet.code} onClose={closeLinkSheet} />
      ) : (
        <ApproveSheet key={sheet.code ?? 'manual'} initialCode={sheet.code} onClose={closeLinkSheet} />
      )}
    </Suspense>
  )
}
