export const GUESS_WARNING_DISMISSED_KEY = 'guess-warning-dismissed'

/** True when slug or source filename marks an AI-guess quiz. */
export function isGuessSubject(slug: unknown, sourcePath = ''): boolean {
  if (typeof slug === 'string' && slug.endsWith('-guess')) return true
  const filename = sourcePath.split('/').pop() ?? ''
  return filename.endsWith('-guess.json')
}

export function isGuessWarningDismissed(): boolean {
  try {
    return localStorage.getItem(GUESS_WARNING_DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

export function setGuessWarningDismissed(): void {
  try {
    localStorage.setItem(GUESS_WARNING_DISMISSED_KEY, 'true')
  } catch {
    // localStorage unavailable — ignore
  }
}
