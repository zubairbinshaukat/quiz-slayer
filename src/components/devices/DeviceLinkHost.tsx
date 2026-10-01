import { closeLinkSheet, useLinkSheet } from '../../lib/linkUi'
import { ApproveSheet } from './ApproveSheet'
import { JoinSheet } from './JoinSheet'

/** Renders whichever device-link sheet is open. Mounted once in the app shell (Convex builds only). */
export function DeviceLinkHost() {
  const sheet = useLinkSheet()
  if (!sheet) return null
  // Mounted fresh per open so each flow starts from a clean state
  return sheet.kind === 'join' ? (
    <JoinSheet onClose={closeLinkSheet} />
  ) : (
    <ApproveSheet key={sheet.code ?? 'manual'} initialCode={sheet.code} onClose={closeLinkSheet} />
  )
}
