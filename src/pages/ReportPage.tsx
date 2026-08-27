import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { brand } from '../data/brand'
import { channels, incidentTypes, indianStates } from '../data/content'
import { cx } from '../lib/cx'
import { useTranslation } from 'react-i18next'
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveCase,
  saveDraft,
} from '../lib/storage'
import type { CaseRecord, IncidentTypeId, ReportDraft } from '../types'

function makeCaseId(): string {
  const number = Math.floor(10000 + Math.random() * 89999)
  return `${brand.casePrefix}-${number}`
}

function formatDateTime(value: string): string {
  if (!value) return 'Not added'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-paper">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {children}
    </p>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-black/[0.07] py-3 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <span className="text-sm leading-6 text-paper">{value || 'Not added'}</span>
    </div>
  )
}

function SuccessView({ record }: { record: CaseRecord }) {
  function downloadAcknowledgement() {
    const content = [
      `${brand.name.toUpperCase()} — ACKNOWLEDGEMENT`,
      '',
      `Reference: ${record.caseId}`,
      `Created: ${record.createdAt}`,
      `Status: ${record.statusLabel}`,
      `State: ${record.state}`,
      `Incident type: ${record.incidentType}`,
      '',
      'Keep this reference to track your complaint.',
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${record.caseId}-acknowledgement.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="bg-brand px-6 py-8 text-ink sm:px-8 sm:py-10">
        <p className="eyebrow text-white/70">Complaint registered</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
          You now have a clear next step.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
          Save your acknowledgement number. You can check the status any time from Track.
        </p>
      </div>

      <div className="p-5 sm:p-7">
        <div className="surface-soft p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow">Acknowledgement number</p>
            <p className="mt-2 break-all font-mono text-xl font-bold text-brand sm:text-2xl">{record.caseId}</p>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-white px-3 py-2 text-xs font-semibold text-paper sm:mt-0">
            <Clock3 className="h-3.5 w-3.5" /> Initial triage in progress
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['01', 'Save the reference'],
            ['02', 'Preserve original evidence'],
            ['03', 'Check status in Track'],
          ].map(([number, label]) => (
            <div key={number} className="rounded-xl border border-black/[0.07] p-4">
              <span className="font-mono text-xs font-bold text-brand">{number}</span>
              <p className="mt-2 text-sm font-semibold text-paper">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to={`/track?case=${encodeURIComponent(record.caseId)}`} className={buttonStyles('primary', 'lg')}>
            Track this complaint <ArrowRight className="h-4 w-4" />
          </Link>
          <Button variant="secondary" size="lg" onClick={downloadAcknowledgement}>
            <Download className="h-4 w-4" /> Download acknowledgement
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function ReportPage() {
  const { t } = useTranslation(['pages', 'common'])
  const steps = [
    { id: 1, label: t('report.steps.incident'), short: t('report.steps.incident') },
    { id: 2, label: t('report.steps.details'), short: t('report.steps.details') },
    { id: 3, label: t('report.steps.evidence'), short: t('report.steps.evidence') },
    { id: 4, label: t('report.steps.review'), short: t('report.steps.review') },
  ]
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type') as IncidentTypeId | null
  const isValidRequestedType = incidentTypes.some((item) => item.id === requestedType)
  const requestedAnonymous = searchParams.get('anonymous') === '1'
  const requestedStory = searchParams.get('story') ?? ''

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<ReportDraft>(() => {
    const saved = loadDraft()
    const next = { ...saved }
    if (isValidRequestedType) {
      next.incidentType = requestedType!
      next.anonymous = requestedType === 'women-child' ? requestedAnonymous : false
    }
    if (requestedStory.trim()) {
      next.copilotText = next.copilotText || requestedStory
      next.description = next.description || requestedStory
    }
    return next
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')
  const [savedLabel, setSavedLabel] = useState('Draft ready')
  const [submitting, setSubmitting] = useState(false)
  const [completedCase, setCompletedCase] = useState<CaseRecord | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedIncident = useMemo(
    () => incidentTypes.find((item) => item.id === draft.incidentType),
    [draft.incidentType],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveDraft(draft)
      setSavedLabel('Saved locally')
    }, 280)
    setSavedLabel('Saving…')
    return () => window.clearTimeout(timeout)
  }, [draft])

  function update<K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function validateCurrentStep(): boolean {
    const nextErrors: Record<string, string> = {}
    if (step === 1 && !draft.incidentType) {
      nextErrors.incidentType = 'Choose the option that best matches what happened.'
    }
    if (step === 2) {
      if (!draft.occurredAt) nextErrors.occurredAt = 'Add the approximate date and time.'
      if (!draft.state) nextErrors.state = 'Choose the state or union territory of the incident.'
      if (!draft.channel) nextErrors.channel = 'Choose where the incident happened.'
      if (draft.incidentType === 'financial' && !draft.amount.trim()) {
        nextErrors.amount = 'Add the amount involved, even if approximate.'
      }
      if (draft.description.trim().length < 30) {
        nextErrors.description = 'Add at least 30 characters so the sequence is understandable.'
      }
    }
    if (step === 4) {
      if (!draft.anonymous) {
        if (draft.fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.'
        if (!/^\d{10}$/.test(draft.mobile.replace(/\s/g, ''))) {
          nextErrors.mobile = 'Enter a 10-digit mobile number.'
        }
      }
      if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
        nextErrors.email = 'Enter a valid email address.'
      }
      if (!draft.consent) nextErrors.consent = 'Confirm the declaration to continue.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function nextStep() {
    if (!validateCurrentStep()) return
    setStep((current) => Math.min(4, current + 1))
  }

  function previousStep() {
    setErrors({})
    setStep((current) => Math.max(1, current - 1))
  }

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files)
    const oversized = list.find((file) => file.size > 5 * 1024 * 1024)
    if (oversized) {
      setFileError(`${oversized.name} is larger than 5 MB.`)
      return
    }
    setFileError('')
    const names = Array.from(new Set([...draft.evidenceNames, ...list.map((file) => file.name)])).slice(0, 6)
    update('evidenceNames', names)
  }

  async function submitReport() {
    if (!validateCurrentStep() || !draft.incidentType) return
    setSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 850))
    const caseId = makeCaseId()
    const createdAt = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date())
    const record: CaseRecord = {
      caseId,
      createdAt,
      incidentType: draft.incidentType,
      state: draft.state || 'Not specified',
      description: draft.description,
      anonymous: draft.anonymous,
      progress: 22,
      statusLabel: 'Complaint received — initial triage',
      assignedUnit: 'Assignment pending',
      timeline: [
        {
          label: 'Complaint submitted',
          detail: `${draft.evidenceNames.length} evidence item${draft.evidenceNames.length === 1 ? '' : 's'} included with the complaint.`,
          timestamp: createdAt,
          status: 'done',
        },
        {
          label: 'Initial triage',
          detail: 'Incident type and location are being checked.',
          timestamp: 'Current stage',
          status: 'active',
        },
        {
          label: 'Jurisdiction assignment',
          detail: 'The relevant cyber cell receives the case next.',
          timestamp: 'Pending',
          status: 'pending',
        },
        {
          label: 'Officer review',
          detail: 'Evidence review begins after assignment.',
          timestamp: 'Pending',
          status: 'pending',
        },
      ],
    }
    saveCase(record)
    clearDraft()
    setCompletedCase(record)
    setSubmitting(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startOver() {
    clearDraft()
    setDraft({ ...emptyDraft })
    setCompletedCase(null)
    setStep(1)
    setErrors({})
  }

  const progress = (step / steps.length) * 100

  return (
    <>
      <PageIntro
        eyebrow={t('report.eyebrow')}
        title={t('report.title')}
        description={t('report.description')}
      />

      <section className="page-shell pb-4">
        {completedCase ? (
          <div className="mx-auto max-w-5xl">
            <SuccessView record={completedCase} />
            <button
              type="button"
              onClick={startOver}
              className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-muted hover:text-paper"
            >
              <ArrowLeft className="h-4 w-4" /> {t('report.startOver')}
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="card overflow-hidden">
              <div className="border-b border-black/[0.07] bg-mist px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted">{savedLabel}</p>
                  <p className="text-sm text-muted">{Math.round(progress)}% complete</p>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/[0.08]">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {steps.map((item) => {
                    const active = item.id === step
                    const done = item.id < step
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => done && setStep(item.id)}
                        disabled={!done}
                        className={cx(
                          'rounded-xl border px-2 py-3 text-left transition sm:px-3',
                          active && 'border-brand bg-brand/[0.06]',
                          done && 'border-black/[0.10] bg-white hover:border-brand/40',
                          !active && !done && 'border-transparent opacity-50',
                        )}
                      >
                        <span className={cx(
                          'flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[0.62rem] font-bold',
                          active ? 'bg-brand text-ink' : done ? 'border border-brand/40 text-brand' : 'bg-black/[0.06] text-muted',
                        )}>
                          {done ? <Check className="h-3.5 w-3.5" /> : item.id}
                        </span>
                        <span className="mt-2 hidden text-[0.68rem] font-semibold text-paper sm:block">{item.short}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div key="step-1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">{t('report.stepOf', { n: 1 })}</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">{t('report.step1Title')}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted">{t('report.step1Help')}</p>

                      <div className="mt-6 grid gap-2">
                        {incidentTypes.map((incident) => {
                          const active = draft.incidentType === incident.id
                          return (
                            <button
                              key={incident.id}
                              type="button"
                              onClick={() => {
                                update('incidentType', incident.id)
                                if (incident.id !== 'women-child') update('anonymous', false)
                              }}
                              className={cx(
                                'flex w-full items-start justify-between gap-6 rounded-xl border p-4 text-left transition',
                                active ? 'border-brand bg-brand/[0.05]' : 'border-black/[0.10] hover:border-brand/40',
                              )}
                            >
                              <span>
                                <span className={cx('block text-[0.95rem]', active ? 'font-semibold text-brand' : 'text-paper')}>{t(`incidents.${incident.id}.title`)}</span>
                                <span className="mt-1 block text-sm leading-6 text-muted">{t(`incidents.${incident.id}.description`)}</span>
                              </span>
                              <span className={cx('mt-0.5 shrink-0 text-sm', active ? 'font-semibold text-brand' : 'text-muted')}>
                                {active ? t('report.selected') : t('report.choose')}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <FieldError>{errors.incidentType}</FieldError>

                      {draft.incidentType === 'financial' ? (
                        <div className="mt-5 rounded-xl bg-alert p-4 text-ink sm:flex sm:items-center sm:justify-between sm:gap-5">
                          <div>
                            <p className="text-sm font-semibold">{t('report.callBefore')}</p>
                            <p className="mt-1 text-sm leading-6 text-white/75">{t('report.callBeforeHelp')}</p>
                          </div>
                          <a
                            href="tel:1930"
                            className="mt-3 inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-white px-3.5 text-sm font-semibold text-alert hover:bg-white/90 sm:mt-0"
                          >
                            {t('report.callNow')}
                          </a>
                        </div>
                      ) : null}

                      {draft.incidentType === 'women-child' ? (
                        <div className="mt-5 rounded-2xl border border-brand/30 bg-brand/[0.04] p-4">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={draft.anonymous}
                              onChange={(event) => update('anonymous', event.target.checked)}
                              className="mt-0.5 h-4 w-4 accent-brand"
                            />
                            <span>
                              <span className="block text-sm font-medium text-paper">{t('report.anonymous')}</span>
                              <span className="mt-1 block text-xs leading-5 text-muted">{t('report.anonymousHelp')}</span>
                            </span>
                          </label>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}

                  {step === 2 ? (
                    <motion.div key="step-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <div>
                        <p className="eyebrow">{t('report.stepOf', { n: 2 })}</p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">{t('report.step2Title')}</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t('report.step2Help')}</p>
                      </div>

                      <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="field-label" htmlFor="occurredAt">Approximate date and time</label>
                          <input
                            id="occurredAt"
                            type="datetime-local"
                            value={draft.occurredAt}
                            onChange={(event) => update('occurredAt', event.target.value)}
                            className="text-field [color-scheme:light]"
                          />
                          <FieldError>{errors.occurredAt}</FieldError>
                        </div>
                        <div>
                          <label className="field-label" htmlFor="state">State / union territory</label>
                          <div className="relative">
                            <select id="state" value={draft.state} onChange={(event) => update('state', event.target.value)} className="select-field">
                              <option value="">Choose location</option>
                              {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                          </div>
                          <FieldError>{errors.state}</FieldError>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="field-label" htmlFor="channel">Where did it happen?</label>
                          <div className="relative">
                            <select id="channel" value={draft.channel} onChange={(event) => update('channel', event.target.value)} className="select-field">
                              <option value="">Choose a channel</option>
                              {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                          </div>
                          <FieldError>{errors.channel}</FieldError>
                        </div>

                        {draft.incidentType === 'financial' ? (
                          <>
                            <div>
                              <label className="field-label" htmlFor="amount">Amount involved</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">₹</span>
                                <input id="amount" value={draft.amount} onChange={(event) => update('amount', event.target.value)} className="text-field pl-8" placeholder="24,500" />
                              </div>
                              <FieldError>{errors.amount}</FieldError>
                            </div>
                            <div>
                              <label className="field-label" htmlFor="transactionId">Transaction ID <span className="font-normal text-muted">(optional)</span></label>
                              <input id="transactionId" value={draft.transactionId} onChange={(event) => update('transactionId', event.target.value)} className="text-field" placeholder="412345678901" />
                            </div>
                          </>
                        ) : null}

                        <div className="sm:col-span-2">
                          <div className="mb-2 flex items-end justify-between gap-4">
                            <label className="field-label mb-0" htmlFor="description">{t('report.whatHappened')}</label>
                            <span className="font-mono text-[0.6rem] text-muted">{draft.description.length}/1000</span>
                          </div>
                          <textarea
                            id="description"
                            value={draft.description}
                            onChange={(event) => update('description', event.target.value.slice(0, 1000))}
                            className="text-area min-h-44"
                            placeholder="Example: I received a call claiming to be from… Then I was asked to… After that…"
                          />
                          <p className="field-help">Do not paste real passwords, PINs, OTPs, Aadhaar, PAN or bank credentials.</p>
                          <FieldError>{errors.description}</FieldError>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {step === 3 ? (
                    <motion.div key="step-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">{t('report.stepOf', { n: 3 })}</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">{t('report.step3Title')}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Add screenshots, transaction receipts, chat exports or a short document.</p>

                      <div
                        className="mt-6 rounded-2xl border border-dashed border-black/[0.18] bg-mist p-7 text-center transition hover:border-brand hover:bg-brand/[0.03] sm:p-10"
                        onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                        onDrop={(event: DragEvent<HTMLDivElement>) => {
                          event.preventDefault()
                          addFiles(event.dataTransfer.files)
                        }}
                      >
                        <h3 className="text-lg font-semibold text-paper">Drop evidence here</h3>
                        <p className="mt-2 text-sm text-muted">PNG, JPG, PDF or text · up to 5 MB each · maximum 6 items</p>
                        <div className="mt-5 flex justify-center">
                          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Plus className="h-4 w-4" /> Choose files
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,application/pdf,text/plain"
                          className="sr-only"
                          onChange={(event) => event.target.files && addFiles(event.target.files)}
                        />
                      </div>
                      {fileError ? <FieldError>{fileError}</FieldError> : null}

                      {draft.evidenceNames.length ? (
                        <div className="mt-5 grid gap-2">
                          {draft.evidenceNames.map((name, index) => (
                            <div key={`${name}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-black/[0.08] px-4 py-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-paper">{name}</p>
                                  <p className="mt-0.5 font-mono text-[0.57rem] uppercase tracking-[0.12em] text-muted">Attached</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => update('evidenceNames', draft.evidenceNames.filter((_, itemIndex) => itemIndex !== index))}
                                className="rounded-lg p-2 text-muted hover:bg-alert/[0.08] hover:text-alert"
                                aria-label={`Remove ${name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {[
                          ['Include', 'Full screen, URL, date and time'],
                          ['Keep', 'Original files without edits'],
                          ['Never add', 'Passwords, PINs or OTPs'],
                        ].map(([label, value], index) => (
                          <div key={label} className={cx('rounded-xl border p-4', index === 2 ? 'border-alert/30 bg-alert/[0.04]' : 'border-black/[0.10]')}>
                            <span className={cx('font-mono text-[0.58rem] uppercase tracking-[0.14em]', index === 2 ? 'text-alert' : 'text-brand')}>{label}</span>
                            <p className="mt-2 text-xs leading-5 text-muted">{value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  {step === 4 ? (
                    <motion.div key="step-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">{t('report.stepOf', { n: 4 })}</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">{t('report.step4Title')}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Check every detail once before you submit.</p>

                      {!draft.anonymous ? (
                        <div className="mt-6 rounded-2xl border border-black/[0.08] p-5 sm:p-6">
                          <div className="mb-5">
                            <h3 className="text-base font-semibold text-paper">Your contact details</h3>
                            <p className="mt-0.5 text-xs text-muted">Used to send updates on this complaint.</p>
                          </div>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <label className="field-label" htmlFor="fullName">Full name</label>
                              <input id="fullName" value={draft.fullName} onChange={(event) => update('fullName', event.target.value)} className="text-field" placeholder="Your full name" />
                              <FieldError>{errors.fullName}</FieldError>
                            </div>
                            <div>
                              <label className="field-label" htmlFor="mobile">Mobile number</label>
                              <input id="mobile" inputMode="numeric" value={draft.mobile} onChange={(event) => update('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))} className="text-field" placeholder="9000001930" />
                              <FieldError>{errors.mobile}</FieldError>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="field-label" htmlFor="email">Email <span className="font-normal text-muted">(optional)</span></label>
                              <input id="email" type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} className="text-field" placeholder="aarav@example.com" />
                              <FieldError>{errors.email}</FieldError>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 rounded-xl border border-black/[0.08] p-5">
                          <p className="text-sm font-medium text-paper">Anonymous reporting selected</p>
                          <p className="mt-1 text-sm leading-6 text-muted">No name, mobile number or email will be included with this complaint.</p>
                        </div>
                      )}

                      <div className="mt-5 surface-soft p-5 sm:p-6">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <h3 className="text-base font-semibold text-paper">Report summary</h3>
                          <button type="button" onClick={() => setStep(1)} className="link-accent text-xs">Edit</button>
                        </div>
                        <SummaryRow label="Incident" value={selectedIncident?.title ?? ''} />
                        <SummaryRow label="Occurred" value={formatDateTime(draft.occurredAt)} />
                        <SummaryRow label="Location" value={draft.state} />
                        <SummaryRow label="Channel" value={draft.channel} />
                        {draft.incidentType === 'financial' ? <SummaryRow label="Amount" value={draft.amount ? `₹${draft.amount}` : ''} /> : null}
                        <SummaryRow label="Evidence" value={draft.evidenceNames.length ? `${draft.evidenceNames.length} item${draft.evidenceNames.length === 1 ? '' : 's'}` : 'No files added'} />
                        <SummaryRow label="Description" value={draft.description} />
                      </div>

                      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-black/[0.08] p-4">
                        <input
                          type="checkbox"
                          checked={draft.consent}
                          onChange={(event) => update('consent', event.target.checked)}
                          className="mt-1 h-4 w-4 accent-brand"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-paper">I confirm the details in this complaint are true to the best of my knowledge.</span>
                          <span className="mt-1 block text-xs leading-5 text-muted">False information may delay the investigation of this complaint.</span>
                        </span>
                      </label>
                      <FieldError>{errors.consent}</FieldError>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" size="lg" onClick={previousStep} disabled={step === 1}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  {step < 4 ? (
                    <Button size="lg" onClick={nextStep}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="lg" onClick={submitReport} loading={submitting}>
                      <ShieldCheck className="h-4 w-4" /> Submit complaint
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="surface-soft p-5">
                <p className="eyebrow">{t('report.currentSelection')}</p>
                {selectedIncident ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-paper">{selectedIncident.title}</p>
                    <p className="mt-3 text-sm leading-6 text-muted">{selectedIncident.hint}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted">Choose an incident type to see contextual guidance.</p>
                )}
              </div>

              <div className="surface-soft p-5">
                <p className="text-sm font-medium text-paper">What to include</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
                  <li>What happened, in the order it happened.</li>
                  <li>Screenshots, receipts and chat exports.</li>
                  <li>Never add passwords, PINs or OTPs.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-alert p-5 text-ink">
                <p className="text-sm font-semibold">Financial loss</p>
                <p className="mt-2 text-xs leading-5 text-white/75">Do not wait for the form. Call 1930, then contact the bank or payment provider.</p>
                <a
                  href="tel:1930"
                  className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90"
                >
                  Call 1930
                </a>
              </div>

            </aside>
          </div>
        )}
      </section>
    </>
  )
}
