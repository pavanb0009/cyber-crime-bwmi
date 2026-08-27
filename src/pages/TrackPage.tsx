import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, CircleDollarSign } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { brand } from '../data/brand'
import { cx } from '../lib/cx'
import { defaultCase, findCase, loadCases } from '../lib/storage'
import type { CaseRecord, MoneyRecovery } from '../types'
import { useTranslation } from 'react-i18next'

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function MoneyRecoveryTracker({ recovery }: { recovery: MoneyRecovery }) {
  const steps = [
    { label: 'Reported', amount: recovery.reported, done: true },
    { label: 'Traced', amount: recovery.traced, done: recovery.traced > 0 },
    { label: 'Lien marked', amount: recovery.lien, done: recovery.lien > 0 },
    { label: 'Restoration review', amount: recovery.restorationEligible, done: recovery.stage === 'review' || recovery.stage === 'refunded' },
    { label: 'Refund', amount: recovery.stage === 'refunded' ? recovery.restorationEligible : 0, done: recovery.stage === 'refunded' },
  ]
  const activeIndex = recovery.stage === 'reported' ? 0 : recovery.stage === 'traced' ? 1 : recovery.stage === 'lien' ? 2 : recovery.stage === 'review' ? 3 : 4

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/[0.03] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-brand">Money recovery tracker</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper">Where is the money now?</h3>
        </div>
        <span className="pill-badge"><CircleDollarSign className="h-3.5 w-3.5" /> Financial case</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Reported loss', recovery.reported],
          ['Amount traced', recovery.traced],
          ['Lien marked', recovery.lien],
          ['Eligible for restoration', recovery.restorationEligible],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-black/[0.07] bg-white p-4">
            <p className="font-mono text-[0.57rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-paper">{formatMoney(Number(value))}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="min-w-[640px]">
          <div className="relative grid grid-cols-5 gap-2">
            <div className="absolute left-[10%] right-[10%] top-3 h-px bg-black/[0.12]" />
            <div className="absolute left-[10%] top-3 h-px bg-brand" style={{ width: `${(activeIndex / 4) * 80}%` }} />
            {steps.map((item, index) => (
              <div key={item.label} className="relative z-10 text-center">
                <span className={cx('mx-auto flex h-6 w-6 items-center justify-center rounded-full border-4 border-white', index < activeIndex ? 'bg-brand' : index === activeIndex ? 'bg-white ring-[3px] ring-inset ring-brand' : 'bg-black/15')}>
                  {index < activeIndex ? <Check className="h-3 w-3 text-ink" /> : null}
                </span>
                <p className={cx('mt-2 text-xs font-semibold', index <= activeIndex ? 'text-paper' : 'text-muted')}>{item.label}</p>
                <p className="mt-1 font-mono text-[0.58rem] text-muted">{item.amount ? formatMoney(item.amount) : 'Pending'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getCase(reference: string): CaseRecord | undefined {
  const clean = reference.trim().toUpperCase()
  if (clean === defaultCase.caseId) return defaultCase
  return findCase(clean)
}

function downloadStatus(record: CaseRecord) {
  const lines = [
    `${brand.name.toUpperCase()} — COMPLAINT STATUS`,
    '',
    `Reference: ${record.caseId}`,
    `Created: ${record.createdAt}`,
    `Status: ${record.statusLabel}`,
    `Progress: ${record.progress}%`,
    `Assigned unit: ${record.assignedUnit}`,
    record.recovery
      ? `Reported: ${formatMoney(record.recovery.reported)} | Traced: ${formatMoney(record.recovery.traced)} | Lien: ${formatMoney(record.recovery.lien)} | Restoration eligible: ${formatMoney(record.recovery.restorationEligible)}`
      : '',
    '',
    'TIMELINE',
    ...record.timeline.map((item) => `- ${item.label} | ${item.timestamp} | ${item.detail}`),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${record.caseId}-status.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function TrackPage() {
  const { t } = useTranslation('pages')
  const [searchParams, setSearchParams] = useSearchParams()
  const initialReference = searchParams.get('case') ?? ''
  const [reference, setReference] = useState(initialReference)
  const [record, setRecord] = useState<CaseRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const recentCases = useMemo(() => loadCases(), [record])

  async function runSearch(value = reference) {
    const clean = value.trim().toUpperCase()
    if (!clean) {
      setError(t('track.enterRef'))
      setRecord(null)
      return
    }
    setLoading(true)
    setError('')
    await new Promise((resolve) => window.setTimeout(resolve, 540))
    const found = getCase(clean)
    if (!found) {
      setRecord(null)
      setError(t('track.noMatch'))
    } else {
      setRecord(found)
      setReference(found.caseId)
      setSearchParams({ case: found.caseId })
    }
    setLoading(false)
  }

  useEffect(() => {
    if (initialReference) void runSearch(initialReference)
    // Deliberately run only for the initial URL value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const incidentTitle = record
    ? t(`incidents.${record.incidentType}.title`, { defaultValue: record.incidentType })
    : ''

  return (
    <>
      <PageIntro
        eyebrow={t('track.eyebrow')}
        title={t('track.title')}
        description={t('track.description')}
        aside={
          <button
            type="button"
            onClick={() => {
              setReference(defaultCase.caseId)
              void runSearch(defaultCase.caseId)
            }}
            className="w-full text-left"
          >
            <p className="text-sm font-medium text-paper">{t('track.recentCase')}</p>
            <p className="link-accent mt-1 font-mono text-sm">{defaultCase.caseId}</p>
          </button>
        }
      />

      <section className="page-shell pb-4">
        <div className="card mx-auto max-w-5xl overflow-hidden">
          <div className="border-b border-black/[0.07] p-5 sm:p-6">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void runSearch()
              }}
            >
              <label htmlFor="caseReference" className="field-label">{t('track.reference')}</label>
              <div className="relative">
                <input
                  id="caseReference"
                  value={reference}
                  onChange={(event) => {
                    setReference(event.target.value.toUpperCase())
                    setError('')
                  }}
                  className="text-field h-12 pr-24 font-mono text-sm uppercase tracking-[0.04em]"
                  placeholder={defaultCase.caseId}
                  autoComplete="off"
                />
                <Button type="submit" size="md" loading={loading} className="absolute right-1 top-1 h-10">
                  {t('track.track')}
                </Button>
              </div>
              {error ? (
                <p className="mt-3 text-sm font-semibold text-alert">{error}</p>
              ) : null}
            </form>
          </div>

          <div className="min-h-[24rem] p-5 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[16rem] flex-col justify-center">
                  <p className="text-base font-medium text-paper">{t('track.loading')}</p>
                </motion.div>
              ) : record ? (
                <motion.div key={record.caseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div>
                    <p className="text-sm text-muted">{t('track.currentStatus')}</p>
                    <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-paper sm:text-3xl">{record.statusLabel}</h2>
                    <p className="mt-4 text-sm text-muted">
                      {record.caseId} · Created {record.createdAt} · {record.progress}% complete
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6 border-y border-black/[0.07] py-5 sm:grid-cols-3">
                    <div>
                      <p className="eyebrow">Assigned unit</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-paper">{record.assignedUnit}</p>
                    </div>
                    <div>
                      <p className="eyebrow">Incident</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-paper">{incidentTitle}</p>
                    </div>
                    <div>
                      <p className="eyebrow">Next action</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-paper">Wait for the next timeline update</p>
                    </div>
                  </div>

                  {record.recovery ? (
                    <div className="mt-7">
                      <MoneyRecoveryTracker recovery={record.recovery} />
                    </div>
                  ) : null}

                  <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
                    <div>
                      <div className="mb-5">
                        <p className="eyebrow">Case timeline</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper">Every stage, in human language.</h3>
                      </div>
                      <div className="relative ml-3 border-l border-black/[0.10] pl-7">
                        {record.timeline.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="relative pb-8 last:pb-0">
                            <span className={cx(
                              'absolute -left-[2.23rem] top-0 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white',
                              item.status === 'done' && 'bg-brand',
                              item.status === 'active' && 'bg-white ring-[3px] ring-inset ring-brand',
                              item.status === 'pending' && 'bg-black/15',
                            )}>
                              {item.status === 'done' ? <Check className="h-2.5 w-2.5 text-ink" /> : null}
                            </span>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                              <div>
                                <p className={cx('text-sm font-semibold', item.status === 'pending' ? 'text-muted' : 'text-paper')}>{item.label}</p>
                                <p className="mt-1 max-w-xl text-xs leading-5 text-muted">{item.detail}</p>
                              </div>
                              <span className={cx('shrink-0 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em]', item.status === 'active' ? 'text-brand' : 'text-muted')}>{item.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <aside className="space-y-4">
                      <div className="surface-soft p-5">
                        <p className="text-sm font-medium text-paper">What happens next</p>
                        <p className="mt-3 text-sm leading-6 text-muted">{t('track.nextUpdate')}</p>
                      </div>
                      <Button variant="secondary" size="lg" className="w-full" onClick={() => downloadStatus(record)}>
                        Download status
                      </Button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(record.caseId).catch(() => undefined)}
                        className="flex h-11 w-full items-center justify-center text-sm text-muted hover:text-paper"
                      >
                        Copy reference
                      </button>
                    </aside>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[16rem] flex-col justify-center">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-paper">{t('track.emptyTitle')}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted">{t('track.emptyBody')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReference(defaultCase.caseId)
                      void runSearch(defaultCase.caseId)
                    }}
                    className={cx(buttonStyles('primary', 'md'), 'mt-5 w-fit')}
                  >
                    {t('track.openRecent')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {recentCases.length ? (
          <div className="mx-auto mt-6 max-w-5xl">
            <p className="eyebrow mb-3">{t('track.recent')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recentCases.slice(0, 4).map((item) => (
                <button
                  key={item.caseId}
                  type="button"
                  onClick={() => {
                    setReference(item.caseId)
                    void runSearch(item.caseId)
                  }}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-black/[0.08] px-4 py-3 text-left transition hover:border-brand/50 hover:bg-mist"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-paper group-hover:text-brand">{item.caseId}</p>
                    <p className="mt-1 text-[0.68rem] text-muted">{item.statusLabel}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  )
}
