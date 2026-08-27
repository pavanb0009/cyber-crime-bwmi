import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { common } from './common'

export const supportedLocales = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn'] as const
export type AppLocale = (typeof supportedLocales)[number]

export const localeNames: Record<AppLocale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  mr: 'मराठी',
  bn: 'বাংলা',
}

export const intlLocales: Record<AppLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
}

const LANGUAGE_KEY = 'rakshak-language'

export function normalizeLocale(value?: string | null): AppLocale {
  const language = value?.toLowerCase().split('-')[0]
  return supportedLocales.includes(language as AppLocale) ? (language as AppLocale) : 'en'
}

function initialLocale(): AppLocale {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved) return normalizeLocale(saved)
  } catch {
    // Continue with the browser language when storage is unavailable.
  }
  return normalizeLocale(navigator.language)
}

export function persistLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, locale)
  } catch {
    // Language switching still works for the current session.
  }
}

const resources = Object.fromEntries(
  supportedLocales.map((locale) => [locale, { common: common[locale] }]),
)

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale(),
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n
