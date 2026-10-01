import { ICON_KEYS } from '../components/ui/SubjectIcons'

const COLORS = ['indigo', 'emerald', 'rose', 'amber', 'violet', 'sky']

/** djb2-style hash — deterministic, stable across runs */
function slugHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Returns the same color every time for the same slug */
export function getSubjectColor(slug) {
  return COLORS[slugHash(slug) % COLORS.length]
}

/** Returns the same icon key every time for the same slug */
export function getSubjectIconKey(slug) {
  // Use a different bit range to decouple icon from color
  return ICON_KEYS[(slugHash(slug) >>> 4) % ICON_KEYS.length]
}
