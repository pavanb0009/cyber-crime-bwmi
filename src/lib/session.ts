export function readSession<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`rakshak-task:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeSession(key: string, value: unknown): void {
  try {
    localStorage.setItem(`rakshak-task:${key}`, JSON.stringify(value))
  } catch {
    // Task state still works for the current view if storage is unavailable.
  }
}

export function clearSession(key: string): void {
  try {
    localStorage.removeItem(`rakshak-task:${key}`)
  } catch {
    // No-op when storage is unavailable.
  }
}

export function patchSearchParams(
  current: URLSearchParams,
  patch: Record<string, string | null | undefined>,
): URLSearchParams {
  const next = new URLSearchParams(current)
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') next.delete(key)
    else next.set(key, value)
  }
  return next
}
