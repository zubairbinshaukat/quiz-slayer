/** Storage accessors that never throw (private mode, blocked site data, quota). */

export function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch { /* storage unavailable */ }
}

export function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch { /* storage unavailable */ }
}

export function ssGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function ssSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch { /* storage unavailable */ }
}
