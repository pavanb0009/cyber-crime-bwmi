import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  EyeOff,
  FileCheck2,
  FileText,
  FolderLock,
  Info,
  LockKeyhole,
  PhoneCall,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { channels, incidentTypes, indianStates } from '../data/content'
import { cx } from '../lib/cx'
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveCase,
  saveDraft,
} from '../lib/storage'
import type { CaseRecord, IncidentTypeId, ReportDraft } from '../types'

const steps = [
  { id: 1, label: 'What happened', short: 'Incident' },
  { id: 2, label: 'Tell us the details', short: 'Details' },
  { id: 3, label: 'Add evidence', short: 'Evidence' },
  { id: 4, label: 'Review and submit', short: 'Review' },
]

const toneClasses = {
  coral: {
    icon: 'bg-coral/[0.10] text-coral',
    active: 'border-coral/[0.35] bg-coral/[0.07]',
  },
  aqua: {
    icon: 'bg-aqua/[0.10] text-aqua',
    active: 'border-aqua/[0.35] bg-aqua/[0.07]',
  },
  signal: {
    icon: 'bg-signal/[0.10] text-signal',
    active: 'border-signal/[0.35] bg-signal/[0.07]',
  },
  saffron: {
    icon: 'bg-saffron/[0.10] text-saffron',
    active: 'border-saffron/[0.35] bg-saffron/[0.07]',
  },
}

function makeCaseId(): string {
  const number = Math.floor(10000 + Math.random() * 89999)
  return `NCRP-DEMO-26-${number}`
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
    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-coral">
      <AlertCircle className="h-3.5 w-3.5" /> {children}
    </p>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/[0.07] py-3 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <span className="text-sm font-semibold leading-6 text-paper">{value || 'Not added'}</span>
    </div>
  )
}

function SuccessView({ record }: { record: CaseRecord }) {
  function downloadAcknowledgement() {
    const content = [
      'RAKSHAK / 1930 — DEMO ACKNOWLEDGEMENT',
      'Independent hackathon prototype — no government system was contacted.',
      '',
      `Reference: ${record.caseId}`,
      `Created: ${record.createdAt}`,
      `Status: ${record.statusLabel}`,
      `State: ${record.state}`,
      `Incident type: ${record.incidentType}`,
      '',
      'Keep this fictional reference to test the Track Complaint journey.',
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
      className="surface overflow-hidden rounded-[1.8rem]"
    >
      <div className="relative overflow-hidden border-b border-signal/[0.15] bg-signal/[0.07] px-6 py-9 sm:px-9 sm:py-12">
        <div className="absolute right-0 top-0 h-44 w-44 translate-x-1/3 -translate-y-1/3 rounded-full border border-signal/20" />
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full border border-signal/10" />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal text-ink shadow-[0_0_45px_rgba(199,255,103,.2)]">
          <Check className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-7 text-signal">Demo complaint created</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.045em] text-paper sm:text-5xl">
          You now have a clear next step.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
          This is a synthetic acknowledgement for the prototype. No live portal, police system, bank or government service was contacted.
        </p>
      </div>

      <div className="p-6 sm:p-9">
        <div className="rounded-2xl border border-white/[0.09] bg-ink/[0.65] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">Demo acknowledgement number</p>
            <p className="mt-2 break-all font-mono text-xl font-bold text-signal sm:text-2xl">{record.caseId}</p>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-aqua/20 bg-aqua/[0.06] px-3 py-2 text-xs font-semibold text-aqua sm:mt-0">
            <Clock3 className="h-3.5 w-3.5" /> Initial triage simulated
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ['01', 'Save the reference'],
            ['02', 'Preserve original evidence'],
            ['03', 'Check status in Track'],
          ].map(([number, label]) => (
            <div key={number} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <span className="font-mono text-xs font-bold text-signal">{number}</span>
              <p className="mt-3 text-sm font-bold text-paper">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to={`/track?case=${encodeURIComponent(record.caseId)}`} className={buttonStyles('primary', 'lg')}>
            Track this demo case <ArrowRight className="h-4 w-4" />
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
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type') as IncidentTypeId | null
  const isValidRequestedType = incidentTypes.some((item) => item.id === requestedType)

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<ReportDraft>(() => {
    const saved = loadDraft()
    return isValidRequestedType ? { ...saved, incidentType: requestedType! } : saved
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
  const SelectedIncidentIcon = selectedIncident?.icon

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
        if (draft.fullName.trim().length < 2) nextErrors.fullName = 'Add a fictional demo name.'
        if (!/^\d{10}$/.test(draft.mobile.replace(/\s/g, ''))) {
          nextErrors.mobile = 'Use a 10-digit fictional demo number.'
        }
      }
      if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
        nextErrors.email = 'Use a valid fictional email format.'
      }
      if (!draft.consent) nextErrors.consent = 'Confirm the prototype and synthetic-data notice.'
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

  function addDemoEvidence() {
    update('evidenceNames', Array.from(new Set([...draft.evidenceNames, 'upi-transaction-demo.png', 'chat-timeline-demo.pdf'])))
    setFileError('')
  }

  function fillDemoDetails() {
    const now = new Date()
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    setDraft((current) => ({
      ...current,
      occurredAt: local,
      state: current.state || 'Karnataka',
      channel: current.channel || (current.incidentType === 'financial' ? 'UPI / payment app' : 'WhatsApp / Telegram'),
      amount: current.incidentType === 'financial' ? '24,500' : current.amount,
      transactionId: current.incidentType === 'financial' ? 'DEMO-UPI-84019' : current.transactionId,
      description:
        current.incidentType === 'financial'
          ? 'A caller claiming to be customer support asked me to approve a UPI collect request for a refund. The payment was debited after I approved it.'
          : 'A fictional demo incident occurred through repeated messages from an unknown account. I saved the profile URL, timestamps and screenshots before blocking it.',
    }))
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
      assignedUnit: 'Assignment pending (demo)',
      timeline: [
        {
          label: 'Complaint submitted',
          detail: `${draft.evidenceNames.length} evidence item${draft.evidenceNames.length === 1 ? '' : 's'} included in the demo package.`,
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
          detail: 'The relevant cyber cell would receive the case next.',
          timestamp: 'Pending',
          status: 'pending',
        },
        {
          label: 'Officer review',
          detail: 'Evidence review would begin after assignment.',
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
        index="01"
        eyebrow="Report an incident"
        title={<>One clear report.<br /><span className="text-signal">Four short steps.</span></>}
        description="Choose what happened in plain language, add only the useful details, review everything once, and leave with a trackable demo acknowledgement."
        aside={
          <div className="surface-soft rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <FolderLock className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
              <div>
                <p className="text-sm font-bold text-paper">Prototype safety boundary</p>
                <p className="mt-1 text-xs leading-5 text-muted">Use fictional information only. Files stay in your browser and are not uploaded.</p>
              </div>
            </div>
          </div>
        }
      />

      <section className="page-shell">
        {completedCase ? (
          <div className="mx-auto max-w-5xl">
            <SuccessView record={completedCase} />
            <button
              type="button"
              onClick={startOver}
              className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-muted hover:text-paper"
            >
              <ArrowLeft className="h-4 w-4" /> Start another demo report
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
            <div className="surface overflow-hidden rounded-[1.8rem]">
              <div className="border-b border-white/[0.08] bg-[#0a1513] px-5 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.13em] text-muted">
                    <Save className="h-3.5 w-3.5 text-aqua" /> {savedLabel}
                  </div>
                  <span className="font-mono text-[0.62rem] font-semibold text-paper/60">{Math.round(progress)}% complete</span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-signal"
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
                          active && 'border-signal/25 bg-signal/[0.07]',
                          done && 'border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05]',
                          !active && !done && 'border-transparent bg-transparent opacity-[0.45]',
                        )}
                      >
                        <span className={cx(
                          'flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[0.62rem] font-bold',
                          active ? 'bg-signal text-ink' : done ? 'bg-aqua/10 text-aqua' : 'bg-white/[0.05] text-muted',
                        )}>
                          {done ? <Check className="h-3.5 w-3.5" /> : item.id}
                        </span>
                        <span className="mt-2 hidden text-[0.68rem] font-bold text-paper sm:block">{item.short}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-9">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div key="step-1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">Step 1 of 4</p>
                      <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-3xl">What best describes the incident?</h2>
                      <p className="mt-2 text-sm leading-6 text-muted">You do not need to know a legal category. Pick the closest match.</p>

                      <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {incidentTypes.map((incident) => {
                          const Icon = incident.icon
                          const active = draft.incidentType === incident.id
                          const tones = toneClasses[incident.tone]
                          return (
                            <button
                              key={incident.id}
                              type="button"
                              onClick={() => {
                                update('incidentType', incident.id)
                                if (incident.id !== 'women-child') update('anonymous', false)
                              }}
                              className={cx(
                                'group relative min-h-[10.5rem] rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 sm:p-5',
                                active ? tones.active : 'border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.045]',
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', tones.icon)}>
                                  <Icon className="h-5 w-5" />
                                </span>
                                <span className={cx(
                                  'flex h-6 w-6 items-center justify-center rounded-full border transition',
                                  active ? 'border-signal bg-signal text-ink' : 'border-white/[0.15] text-transparent',
                                )}>
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              </div>
                              <h3 className="mt-5 text-base font-extrabold tracking-[-0.02em] text-paper">{incident.title}</h3>
                              <p className="mt-1.5 text-xs leading-5 text-muted">{incident.description}</p>
                            </button>
                          )
                        })}
                      </div>
                      <FieldError>{errors.incidentType}</FieldError>

                      {draft.incidentType === 'financial' ? (
                        <div className="mt-5 rounded-2xl border border-coral/20 bg-coral/[0.06] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
                          <div className="flex items-start gap-3">
                            <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                            <div>
                              <p className="text-sm font-extrabold text-paper">Call 1930 before continuing.</p>
                              <p className="mt-1 text-xs leading-5 text-muted">Then contact your bank or payment provider and preserve the transaction details.</p>
                            </div>
                          </div>
                          <a href="tel:1930" className={cx(buttonStyles('danger', 'sm'), 'mt-3 w-full shrink-0 sm:mt-0 sm:w-auto')}>Call now</a>
                        </div>
                      ) : null}

                      {draft.incidentType === 'women-child' ? (
                        <div className="mt-5 rounded-2xl border border-signal/20 bg-signal/[0.055] p-4">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={draft.anonymous}
                              onChange={(event) => update('anonymous', event.target.checked)}
                              className="mt-0.5 h-4 w-4 accent-[#c7ff67]"
                            />
                            <span>
                              <span className="flex items-center gap-2 text-sm font-extrabold text-paper"><EyeOff className="h-4 w-4 text-signal" /> Report anonymously</span>
                              <span className="mt-1 block text-xs leading-5 text-muted">The contact fields will be skipped. This remains a simulated submission.</span>
                            </span>
                          </label>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}

                  {step === 2 ? (
                    <motion.div key="step-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="eyebrow">Step 2 of 4</p>
                          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-3xl">Tell the story in sequence.</h2>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Approximate details are okay. Focus on who contacted you, what they asked, and what happened next.</p>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={fillDemoDetails} className="shrink-0">
                          <FileCheck2 className="h-4 w-4" /> Use demo details
                        </Button>
                      </div>

                      <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="field-label" htmlFor="occurredAt">Approximate date and time</label>
                          <input
                            id="occurredAt"
                            type="datetime-local"
                            value={draft.occurredAt}
                            onChange={(event) => update('occurredAt', event.target.value)}
                            className="text-field [color-scheme:dark]"
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
                              <input id="transactionId" value={draft.transactionId} onChange={(event) => update('transactionId', event.target.value)} className="text-field" placeholder="DEMO-UPI-84019" />
                            </div>
                          </>
                        ) : null}

                        <div className="sm:col-span-2">
                          <div className="mb-2 flex items-end justify-between gap-4">
                            <label className="field-label mb-0" htmlFor="description">What happened?</label>
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
                      <p className="eyebrow">Step 3 of 4</p>
                      <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-3xl">Preserve the proof, not the clutter.</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Add screenshots, transaction receipts, chat exports or a short document. The prototype stores file names only.</p>

                      <div
                        className="mt-7 rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.025] p-7 text-center transition hover:border-aqua/30 hover:bg-aqua/[0.025] sm:p-10"
                        onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                        onDrop={(event: DragEvent<HTMLDivElement>) => {
                          event.preventDefault()
                          addFiles(event.dataTransfer.files)
                        }}
                      >
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-aqua/20 bg-aqua/[0.07] text-aqua">
                          <UploadCloud className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 text-lg font-extrabold text-paper">Drop evidence here</h3>
                        <p className="mt-2 text-sm text-muted">PNG, JPG, PDF or text · up to 5 MB each · maximum 6 items</p>
                        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Plus className="h-4 w-4" /> Choose files
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={addDemoEvidence}>
                            Add demo evidence
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
                            <div key={`${name}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/[0.08] text-signal">
                                  <FileText className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-paper">{name}</p>
                                  <p className="mt-0.5 font-mono text-[0.57rem] uppercase tracking-[0.12em] text-muted">Stored locally · demo only</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => update('evidenceNames', draft.evidenceNames.filter((_, itemIndex) => itemIndex !== index))}
                                className="rounded-lg p-2 text-muted hover:bg-coral/[0.08] hover:text-coral"
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
                          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                            <span className={cx('font-mono text-[0.58rem] uppercase tracking-[0.14em]', index === 2 ? 'text-coral' : 'text-aqua')}>{label}</span>
                            <p className="mt-2 text-xs leading-5 text-muted">{value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  {step === 4 ? (
                    <motion.div key="step-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">Step 4 of 4</p>
                      <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-3xl">Review once. Submit with confidence.</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">This final screen makes the privacy boundary and every submitted detail visible before the action.</p>

                      {!draft.anonymous ? (
                        <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                          <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua/[0.08] text-aqua"><UserRound className="h-5 w-5" /></span>
                            <div>
                              <h3 className="text-base font-extrabold text-paper">Fictional demo contact</h3>
                              <p className="mt-0.5 text-xs text-muted">Used only to complete the prototype journey.</p>
                            </div>
                          </div>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <label className="field-label" htmlFor="fullName">Full name</label>
                              <input id="fullName" value={draft.fullName} onChange={(event) => update('fullName', event.target.value)} className="text-field" placeholder="Aarav Demo" />
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
                        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-signal/20 bg-signal/[0.055] p-5">
                          <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                          <div>
                            <p className="text-sm font-extrabold text-paper">Anonymous reporting selected</p>
                            <p className="mt-1 text-xs leading-5 text-muted">No name, mobile number or email will be included in this demo record.</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#091311] p-5 sm:p-6">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <h3 className="text-base font-extrabold text-paper">Report summary</h3>
                          <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-aqua hover:text-paper">Edit</button>
                        </div>
                        <SummaryRow label="Incident" value={selectedIncident?.title ?? ''} />
                        <SummaryRow label="Occurred" value={formatDateTime(draft.occurredAt)} />
                        <SummaryRow label="Location" value={draft.state} />
                        <SummaryRow label="Channel" value={draft.channel} />
                        {draft.incidentType === 'financial' ? <SummaryRow label="Amount" value={draft.amount ? `₹${draft.amount}` : ''} /> : null}
                        <SummaryRow label="Evidence" value={draft.evidenceNames.length ? `${draft.evidenceNames.length} item${draft.evidenceNames.length === 1 ? '' : 's'}` : 'No files added'} />
                        <SummaryRow label="Description" value={draft.description} />
                      </div>

                      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                        <input
                          type="checkbox"
                          checked={draft.consent}
                          onChange={(event) => update('consent', event.target.checked)}
                          className="mt-1 h-4 w-4 accent-[#c7ff67]"
                        />
                        <span>
                          <span className="block text-sm font-bold text-paper">I understand this is an independent prototype using synthetic data.</span>
                          <span className="mt-1 block text-xs leading-5 text-muted">Submitting creates a local demo record only. It is not a complaint to the Government of India or any police authority.</span>
                        </span>
                      </label>
                      <FieldError>{errors.consent}</FieldError>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" size="lg" onClick={previousStep} disabled={step === 1}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  {step < 4 ? (
                    <Button size="lg" onClick={nextStep}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="lg" onClick={submitReport} loading={submitting}>
                      <ShieldCheck className="h-4 w-4" /> Create demo complaint
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="surface-soft rounded-2xl p-5">
                <p className="eyebrow">Current selection</p>
                {selectedIncident && SelectedIncidentIcon ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', toneClasses[selectedIncident.tone].icon)}>
                        <SelectedIncidentIcon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-extrabold text-paper">{selectedIncident.title}</p>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted">{selectedIncident.hint}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted">Choose an incident type to see contextual guidance.</p>
                )}
              </div>

              <div className="surface-soft rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-paper">
                  <LockKeyhole className="h-4 w-4 text-aqua" /> What stays private
                </div>
                <ul className="mt-4 space-y-3 text-xs leading-5 text-muted">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> No API calls or live government integration.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> File contents never leave this device.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> Drafts use browser storage only.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-coral/[0.18] bg-coral/[0.055] p-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-paper">
                  <PhoneCall className="h-4 w-4 text-coral" /> Financial loss
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">Do not wait for the form. Call 1930, then contact the bank or payment provider.</p>
                <a href="tel:1930" className={cx(buttonStyles('danger', 'sm'), 'mt-4 w-full')}>Call 1930</a>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <p className="text-xs leading-5 text-muted">In production, OTP, identity verification, jurisdiction routing and police-system handoff would require approved secure integrations.</p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  )
}
