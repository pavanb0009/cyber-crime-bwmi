import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { demoSuspectResults, identifierConfig } from '../data/content'
import { cx } from '../lib/cx'
import type { IdentifierType, SuspectResult } from '../types'
import { useTranslation } from 'react-i18next'

function normalise(type: IdentifierType, value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (type === 'phone') return trimmed.replace(/\D/g, '')
  if (type === 'url') return trimmed.replace(/\/$/, '')
  return trimmed
}

function validate(type: IdentifierType, value: string): string {
  const clean = value.trim()
  if (!clean) return `Enter a ${identifierConfig[type].label.toLowerCase()}.`
  if (type === 'phone' && !/^\d{10}$/.test(clean.replace(/\D/g, ''))) return 'Use a 10-digit mobile number without +91.'
  if (type === 'upi' && !/^[\w.-]{2,}@[\w.-]{2,}$/.test(clean)) return 'Enter a UPI ID in the format name@bank.'
  if (type === 'email' && !/^\S+@\S+\.\S+$/.test(clean)) return 'Enter a valid email address.'
  if (type === 'url') {
    try {
      const url = new URL(clean.startsWith('http') ? clean : `https://${clean}`)
      if (!url.hostname.includes('.')) return 'Enter a complete website address.'
    } catch {
      return 'Enter a valid website address.'
    }
  }
  return ''
}

function clearResult(type: IdentifierType): SuspectResult {
  return {
    risk: 'clear',
    title: 'No matching report in the demo repository',
    summary: `This synthetic ${identifierConfig[type].label.toLowerCase()} is not present in the small demo dataset. That is not proof that it is safe.`,
    reports: 0,
    firstSeen: null,
    signals: ['No exact demo match', 'Repository coverage is intentionally limited', 'Scammers change identifiers quickly'],
    nextSteps: ['Verify through another trusted channel', 'Do not share OTPs, PINs or screen access', 'Report anything suspicious or harmful'],
  }
}

const riskStyles = {
  high: {
    labelKey: 'check.highRisk' as const,
    panel: 'border-alert bg-alert',
    title: 'text-ink',
    body: 'text-white/75',
    badge: 'bg-white text-alert',
  },
  medium: {
    labelKey: 'check.caution' as const,
    panel: 'border-alert/30 bg-alert/[0.05]',
    title: 'text-paper',
    body: 'text-muted',
    badge: 'bg-alert text-ink',
  },
  clear: {
    labelKey: 'check.noMatch' as const,
    panel: 'border-brand/30 bg-brand/[0.04]',
    title: 'text-paper',
    body: 'text-muted',
    badge: 'bg-brand text-ink',
  },
}

export function CheckPage() {
  const { t } = useTranslation('pages')
  const identifierTypes: Array<{ id: IdentifierType; label: string }> = [
    { id: 'phone', label: t('check.phone') },
    { id: 'upi', label: t('check.upi') },
    { id: 'email', label: t('check.email') },
    { id: 'url', label: t('check.website') },
  ]
  const [type, setType] = useState<IdentifierType>('phone')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SuspectResult | null>(null)
  const [checkedValue, setCheckedValue] = useState('')
  const config = identifierConfig[type]

  async function runCheck(inputValue = value) {
    const validationError = validate(type, inputValue)
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    await new Promise((resolve) => window.setTimeout(resolve, 720))
    const key = normalise(type, inputValue)
    const matched = demoSuspectResults[type]?.[key]
    setResult(matched ?? clearResult(type))
    setCheckedValue(inputValue.trim())
    setLoading(false)
  }

  function chooseType(nextType: IdentifierType) {
    setType(nextType)
    setValue('')
    setError('')
    setResult(null)
    setCheckedValue('')
  }

  function useExample() {
    setValue(config.example)
    setError('')
    void runCheck(config.example)
  }

  return (
    <>
      <PageIntro
        eyebrow={t('check.eyebrow')}
        title={t('check.title')}
        description={t('check.description')}
        aside={t('check.aside')}
      />

      <section className="page-shell pb-4">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="card overflow-hidden">
              <div className="border-b border-black/[0.07] p-5 sm:p-6">
                <p className="eyebrow">{t('check.scan')}</p>
                <h2 className="section-title mt-2">{t('check.whatCheck')}</h2>

                <div className="mt-6 flex gap-5 border-b border-black/[0.08]">
                  {identifierTypes.map((item) => {
                    const active = type === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => chooseType(item.id)}
                        className={cx(
                          '-mb-px border-b-2 py-2 text-sm transition',
                          active
                            ? 'border-brand font-semibold text-brand'
                            : 'border-transparent text-muted hover:text-paper',
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                <form
                  className="mt-6"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void runCheck()
                  }}
                >
                  <label htmlFor="identifier" className="field-label">{config.label}</label>
                  <div className="relative">
                    <input
                      id="identifier"
                      value={value}
                      inputMode={type === 'phone' ? 'numeric' : 'text'}
                      onChange={(event) => {
                        setValue(event.target.value)
                        setError('')
                      }}
                      className="text-field h-12 pr-24 text-base"
                      placeholder={config.placeholder}
                      autoComplete="off"
                    />
                    {value ? (
                      <button
                        type="button"
                        onClick={() => {
                          setValue('')
                          setResult(null)
                        }}
                        className="absolute right-[5.6rem] top-1/2 -translate-y-1/2 text-sm text-muted hover:text-paper"
                        aria-label="Clear input"
                      >
                        Clear
                      </button>
                    ) : null}
                    <Button type="submit" size="md" loading={loading} className="absolute right-1 top-1 h-10">
                      Check
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">{config.helper}</p>
                    <button type="button" onClick={useExample} className="link-accent text-left text-sm">
                      Try flagged demo
                    </button>
                  </div>
                  {error ? (
                    <p className="mt-3 text-sm font-semibold text-alert">{error}</p>
                  ) : null}
                </form>
              </div>

              <div className="min-h-[22rem] p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[16rem] flex-col justify-center">
                      <p className="text-base font-medium text-paper">Checking…</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Comparing the identifier against the local demo repository.</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div key={`${result.risk}-${checkedValue}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className={cx('rounded-2xl border p-5 sm:p-6', riskStyles[result.risk].panel)}>
                        <span className={cx('inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em]', riskStyles[result.risk].badge)}>
                          {t(riskStyles[result.risk].labelKey)}
                        </span>
                        <h3 className={cx('mt-3 text-xl font-semibold tracking-[-0.02em] sm:text-2xl', riskStyles[result.risk].title)}>{result.title}</h3>
                        <p className={cx('mt-2 max-w-2xl text-sm leading-6', riskStyles[result.risk].body)}>{result.summary}</p>
                        <p className={cx('mt-4 text-sm', riskStyles[result.risk].body)}>
                          Checked: <span className={cx('font-medium', riskStyles[result.risk].title)}>{checkedValue}</span>
                          {result.reports !== null ? ` · ${result.reports} demo reports · first seen ${result.firstSeen ?? '—'}` : null}
                        </p>
                      </div>

                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="eyebrow">Why this result</p>
                          <ul className="mt-3 space-y-2 border-t border-black/[0.07] pt-3">
                            {result.signals.map((signal) => (
                              <li key={signal} className="text-sm leading-6 text-paper">{signal}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow">What to do next</p>
                          <ul className="mt-3 space-y-2 border-t border-black/[0.07] pt-3">
                            {result.nextSteps.map((step) => (
                              <li key={step} className="text-sm leading-6 text-paper">{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 border-t border-black/[0.07] pt-5 sm:flex-row">
                        <Link
                          to="/report?type=suspicious-content"
                          className={buttonStyles(result.risk === 'high' ? 'danger' : 'primary', 'lg')}
                        >
                          Report this identifier
                        </Link>
                        <Button variant="secondary" size="lg" onClick={() => {
                          navigator.clipboard?.writeText(checkedValue).catch(() => undefined)
                        }}>
                          Copy identifier
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[16rem] flex-col justify-center">
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-paper">Check before you pay, click or reply.</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-muted">Choose an identifier above or use the flagged demo value to see a complete result.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="surface-soft p-5">
              <p className="eyebrow">Before you trust it</p>
              <div className="mt-4 space-y-4">
                {[
                  ['Verify separately', 'Call a known number or open the service directly.'],
                  ['Ignore urgency', 'Pressure to act now is a common warning signal.'],
                  ['Protect control', 'Never share OTPs, PINs or remote screen access.'],
                ].map(([title, detail]) => (
                  <div key={title}>
                    <p className="text-sm font-medium text-paper">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-alert p-5 text-ink">
              <p className="text-sm font-semibold">Already lost money?</p>
              <p className="mt-2 text-xs leading-5 text-white/75">Do not stop at a suspect check. Call 1930 and file a financial-fraud complaint.</p>
              <a
                href="tel:1930"
                className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90"
              >
                Call 1930
              </a>
            </div>

            <div className="surface-soft p-5">
              <p className="text-sm leading-6 text-muted">A repository can contain errors and never covers every scam. A clean result cannot certify that an identifier is safe.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
