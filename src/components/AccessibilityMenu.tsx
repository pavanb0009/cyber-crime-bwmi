import { useEffect, useRef, useState } from 'react'
import { Accessibility, Check, Minus, Plus, X } from 'lucide-react'
import { Button } from './Button'

export function AccessibilityMenu() {
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-muted transition hover:border-white/20 hover:text-paper"
        aria-label="Accessibility settings"
        aria-expanded={open}
      >
        <Accessibility className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div className="surface absolute right-0 top-12 z-50 w-72 rounded-2xl p-4 shadow-signal">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-paper">Accessibility</p>
              <p className="mt-1 text-xs leading-5 text-muted">Preferences apply instantly.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-paper"
              aria-label="Close accessibility menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setLargeText((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left hover:bg-white/[0.055]"
            >
              <span>
                <span className="block text-sm font-semibold text-paper">Larger text</span>
                <span className="mt-0.5 block text-xs text-muted">Increase interface scale</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-signal">
                {largeText ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReduceMotion((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left hover:bg-white/[0.055]"
            >
              <span>
                <span className="block text-sm font-semibold text-paper">Reduce motion</span>
                <span className="mt-0.5 block text-xs text-muted">Minimise animated effects</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-signal">
                {reduceMotion ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </span>
            </button>
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => {
            setLargeText(false)
            setReduceMotion(false)
          }}>
            Reset preferences
          </Button>
        </div>
      ) : null}
    </div>
  )
}
