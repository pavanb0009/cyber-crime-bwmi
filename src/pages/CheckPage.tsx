import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { identifierConfig, suspectReports } from '../data/content'
import { cx } from '../lib/cx'
import { patchSearchParams, writeSession } from '../lib/session'
import type { IdentifierType, SuspectResult } from '../types'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

function normalise(type: IdentifierType, value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (type === 'phone') return trimmed.replace(/\D/g, '')
  if (type === 'url') return trimmed.replace(/\/$/, '')
  return trimmed
}

function validate(type: IdentifierType, value: string, t: TFunction): string {
  const clean = value.trim()
  const field = t(`check.fields.${type}.label`)
  if (!clean) return t('check.enterValue', { field })
  if (type === 'phone' && !/^\d{10}$/.test(clean.replace(/\D/g, ''))) return t('check.phoneFormat')
  if (type === 'upi' && !/^[\w.-]{2,}@[\w.-]{2,}$/.test(clean)) return t('check.upiFormat')
  if (type === 'email' && !/^\S+@\S+\.\S+$/.test(clean)) return t('check.emailFormat')
  if (type === 'url') {
    try {
      const url = new URL(clean.startsWith('http') ? clean : `https://${clean}`)
      if (!url.hostname.includes('.')) return t('check.websiteIncomplete')
    } catch {
      return t('check.websiteInvalid')
    }
  }
  return ''
}

function clearResult(type: IdentifierType): SuspectResult {
  return {
    risk: 'clear',
    title: 'No reports found for this identifier',
    summary: `This ${identifierConfig[type].label.toLowerCase()} has not been reported yet. That is not proof that it is safe.`,
    reports: 0,
    firstSeen: null,
    signals: ['No matching reports', 'New scam identifiers appear every day', 'Scammers change identifiers quickly'],
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
  const { t } = useTranslation(['pages', 'common'])
  const [searchParams, setSearchParams] = useSearchParams()
  const identifierTypes: Array<{ id: IdentifierType; label: string }> = [
    { id: 'phone', label: t('check.phone') },
    { id: 'upi', label: t('check.upi') },
    { id: 'email', label: t('check.email') },
    { id: 'url', label: t('check.website') },
  ]
  const queryType = (['phone', 'upi', 'email', 'url'].includes(searchParams.get('type') ?? '')
    ? searchParams.get('type')
    : 'phone') as IdentifierType
  const queryValue = searchParams.get('q') ?? ''
  const [type, setType] = useState<IdentifierType>(queryType)
  const [value, setValue] = useState(queryValue)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SuspectResult | null>(null)
  const [checkedValue, setCheckedValue] = useState('')
  const hydratedQuery = useRef('')

  function writeQuery(nextType: IdentifierType, nextValue: string | null, replace = false) {
    setSearchParams(
      (current) => patchSearchParams(current, { type: nextType, q: nextValue }),
      { replace },
    )
  }

  async function runCheck(inputValue = value, options: { delay?: boolean; syncUrl?: boolean; nextType?: IdentifierType } = {}) {
    const { delay = true, syncUrl = true, nextType = type } = options
    const validationError = validate(nextType, inputValue, t)
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    if (delay) await new Promise((resolve) => window.setTimeout(resolve, 420))
    const key = normalise(nextType, inputValue)
    const matched = suspectReports[nextType]?.[key]
    const nextResult = matched ?? clearResult(nextType)
    setResult(nextResult)
    setCheckedValue(inputValue.trim())
    hydratedQuery.current = `${nextType}:${inputValue.trim()}`
    writeSession('check', { type: nextType, q: inputValue.trim() })
    if (syncUrl) writeQuery(nextType, inputValue.trim())
    setLoading(false)
  }

  function chooseType(nextType: IdentifierType) {
    setType(nextType)
    setValue('')
    setError('')
    setResult(null)
    setCheckedValue('')
    writeQuery(nextType, null)
  }

  function useExample() {
    const example = identifierConfig[type].example
    setValue(example)
    setError('')
    void runCheck(example)
  }

  useEffect(() => {
    setType(queryType)
    if (queryValue) {
      setValue(queryValue)
      if (hydratedQuery.current === `${queryType}:${queryValue}`) return
      hydratedQuery.current = `${queryType}:${queryValue}`
      void runCheck(queryValue, { delay: false, syncUrl: false, nextType: queryType })
      return
    }
    hydratedQuery.current = ''
    setResult(null)
    setCheckedValue('')
    // Keep the typed value when browser back clears the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryType, queryValue])

  return (
    <>
      <PageIntro title={t('check.eyebrow')} />

      <section className="page-shell pb-4">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="card overflow-hidden">
              <div className="border-b border-black/[0.07] p-5 sm:p-6">
                <label className="field-label">{t('check.whatCheck')}</label>

                <div className="mt-3 flex flex-wrap gap-2">
                  {identifierTypes.map((item) => {
                    const active = type === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => chooseType(item.id)}
                        className={cx(
                          'rounded-lg border-2 px-3.5 py-2 text-sm font-medium transition',
                          active
                            ? 'border-brand bg-brand/[0.08] text-brand'
                            : 'border-fieldBorder bg-field text-muted hover:border-brand/50 hover:text-paper',
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                <form
                  className="mt-5"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void runCheck()
                  }}
                >
                  <label htmlFor="identifier" className="field-label">{t(`check.fields.${type}.label`)}</label>
                  <div className="relative">
                    <input
                      id="identifier"
                      value={value}
                      inputMode={type === 'phone' ? 'numeric' : 'text'}
                      onChange={(event) => {
                        setValue(event.target.value)
                        setError('')
                      }}
                      className={cx('text-field h-12 pr-24 text-base', error && 'field-invalid')}
                      placeholder={t(`check.fields.${type}.placeholder`)}
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
                        aria-label={t('check.clearInput')}
                      >
                        {t('actions.clear', { ns: 'common' })}
                      </button>
                    ) : null}
                    <Button type="submit" size="md" loading={loading} className="absolute right-1 top-1 h-10">
                      {t('check.checkAction')}
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">{t(`check.fields.${type}.helper`)}</p>
                    <button type="button" onClick={useExample} className="link-accent text-left text-sm">
                      {t('check.tryReported')}
                    </button>
                  </div>
                  {error ? (
                    <p className="mt-3 text-sm font-semibold text-alert">{error}</p>
                  ) : null}
                </form>
              </div>

              <div className="min-h-[8rem] p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8">
                      <p className="text-sm font-medium text-paper">{t('check.checking')}</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{t('check.matching')}</p>
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
                          {t('check.checked')}: <span className={cx('font-medium', riskStyles[result.risk].title)}>{checkedValue}</span>
                          {result.reports !== null
                            ? ` · ${t('check.reports', { count: result.reports })} · ${t('check.firstSeen')} ${result.firstSeen ?? '-'}`
                            : null}
                        </p>
                      </div>

                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="eyebrow">{t('check.whyResult')}</p>
                          <ul className="mt-3 space-y-2 border-t border-black/[0.07] pt-3">
                            {result.signals.map((signal) => (
                              <li key={signal} className="text-sm leading-6 text-paper">{signal}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow">{t('check.whatNext')}</p>
                          <ul className="mt-3 space-y-2 border-t border-black/[0.07] pt-3">
                            {result.nextSteps.map((step) => (
                              <li key={step} className="text-sm leading-6 text-paper">{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 border-t border-black/[0.07] pt-5 sm:flex-row">
                        <Link
                          to={
                            result.risk === 'high'
                              ? `/report?type=financial&mode=emergency&suspect=${encodeURIComponent(checkedValue)}`
                              : `/report?type=suspicious-content&suspect=${encodeURIComponent(checkedValue)}`
                          }
                          className={buttonStyles(result.risk === 'high' ? 'danger' : 'primary', 'lg')}
                        >
                          {result.risk === 'high' ? (
                            <>
                              {t('check.alreadyPaid')} <ArrowRight className="h-4 w-4" />
                            </>
                          ) : (
                            t('check.reportIdentifier')
                          )}
                        </Link>
                        {result.risk === 'high' ? (
                          <Link to={`/report?type=suspicious-content&suspect=${encodeURIComponent(checkedValue)}`} className={buttonStyles('secondary', 'lg')}>
                            {t('check.reportIdentifier')}
                          </Link>
                        ) : null}
                        <Button variant="secondary" size="lg" onClick={() => {
                          navigator.clipboard?.writeText(checkedValue).catch(() => undefined)
                        }}>
                          {t('check.copyIdentifier')}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
                      <p className="max-w-md text-sm leading-6 text-muted">{t('check.emptyBody')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="surface-soft p-4">
              <p className="text-sm font-medium text-paper">{t('check.beforeTrust')}</p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
                <li>{t('check.before1')}</li>
                <li>{t('check.before2')}</li>
                <li>{t('check.before3')}</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-alert p-5 text-ink">
              <p className="text-sm font-semibold">{t('home.lostMoney')}</p>
              <p className="mt-2 text-xs leading-5 text-white/75">{t('check.lostMoneyHelp')}</p>
              <Link
                to="/report?type=financial&mode=emergency"
                className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90"
              >
                {t('home.lostMoney')}
              </Link>
              <a
                href="tel:1930"
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white hover:bg-white/15"
              >
                {t('actions.call1930', { ns: 'common' })}
              </a>
            </div>

            <div className="surface-soft p-5">
              <p className="text-sm leading-6 text-muted">{t('check.caveat')}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
