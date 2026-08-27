import { useEffect, useRef, useState } from 'react'
import { Check, Minus, Plus, Settings, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

export function AccessibilityMenu() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('text-large', largeText)
  }, [largeText])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-black transition hover:bg-black/[0.04]"
        aria-label={t('accessibility.label')}
        aria-expanded={open}
      >
        <Settings className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <div className="card absolute right-0 top-9 z-50 w-72 p-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-paper">{t('accessibility.label')}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{t('accessibility.preferences')}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted hover:bg-black/[0.04] hover:text-paper"
              aria-label={t('accessibility.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setLargeText((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-mist px-3 py-3 text-left hover:bg-[#efeff1]"
            >
              <span>
                <span className="block text-sm font-semibold text-paper">{t('accessibility.largerText')}</span>
                <span className="mt-0.5 block text-xs text-muted">{t('accessibility.largerTextHint')}</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-paper">
                {largeText ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReduceMotion((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-mist px-3 py-3 text-left hover:bg-[#efeff1]"
            >
              <span>
                <span className="block text-sm font-semibold text-paper">{t('accessibility.reduceMotion')}</span>
                <span className="mt-0.5 block text-xs text-muted">{t('accessibility.reduceMotionHint')}</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-paper">
                {reduceMotion ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </span>
            </button>
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => {
            setLargeText(false)
            setReduceMotion(false)
          }}>
            {t('accessibility.reset')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
