import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  languageGroups,
  localeEnglishNames,
  localeNames,
  normalizeLocale,
  type AppLocale,
} from '../i18n'
import { cx } from '../lib/cx'

export function LanguageMenu() {
  const { t, i18n } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const current = normalizeLocale(i18n.resolvedLanguage)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function select(locale: AppLocale) {
    void i18n.changeLanguage(locale)
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-black transition hover:bg-black/[0.04]"
        aria-label={t('language.select')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden max-w-[7.5rem] truncate sm:inline">{localeNames[current]}</span>
        <ChevronDown className={cx('h-3.5 w-3.5 text-muted transition', open && 'rotate-180')} aria-hidden />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={t('language.select')}
          className="card absolute right-0 top-10 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-2"
        >
          <p className="px-2 pb-2 pt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('language.label')}
          </p>
          <div className="max-h-[min(22rem,70vh)] overflow-y-auto">
            {languageGroups.map((group) => (
              <div key={group.id} className="mb-2 last:mb-0">
                <div className="grid grid-cols-1">
                  {group.locales.map((locale) => {
                    const active = locale === current
                    return (
                      <button
                        key={locale}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => select(locale)}
                        className={cx(
                          'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition',
                          active ? 'bg-brand/[0.08]' : 'hover:bg-mist',
                        )}
                      >
                        <span>
                          <span className="block text-sm font-semibold text-paper">{localeNames[locale]}</span>
                          <span className="mt-0.5 block text-[0.7rem] text-muted">{localeEnglishNames[locale]}</span>
                        </span>
                        {active ? <Check className="h-4 w-4 text-brand" aria-hidden /> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
