import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export type ThemePreference = 'system' | Theme

export const THEME_KEY = 'rakshak-theme-pref'
export const THEME_EVENT = 'rakshak-theme'

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
  } catch {
    // Storage can be unavailable in private mode.
  }
  return 'system'
}

export function resolveTheme(preference: ThemePreference = getThemePreference()): Theme {
  return preference === 'system' ? systemTheme() : preference
}

export function applyTheme(preference: ThemePreference, options: { persist?: boolean } = {}) {
  const persist = options.persist !== false
  const resolved = resolveTheme(preference)
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#000000' : '#ffffff')
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, preference)
    } catch {
      // Theme still applies for this session.
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT))
}

export function initTheme() {
  applyTheme(getThemePreference(), { persist: false })
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') applyTheme('system', { persist: false })
  })
}

export function useResolvedTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme())

  useEffect(() => {
    function sync() {
      setTheme(resolveTheme())
    }
    window.addEventListener(THEME_EVENT, sync)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    return () => {
      window.removeEventListener(THEME_EVENT, sync)
      media.removeEventListener('change', sync)
    }
  }, [])

  return theme
}
