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
  Mic,
  MicOff,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { brand } from '../data/brand'
import { channels, incidentTypes, indianStates } from '../data/content'
import { cx } from '../lib/cx'
import { useTranslation } from 'react-i18next'
import { clearFiles, getFiles, putFiles } from '../lib/fileStore'
import {
  classifyEvidenceName,
  classifyIncident,
  evidenceCompleteness,
} from '../lib/intelligence'
import { transcribeAudio, type CallLanguage } from '../lib/callAnalysis'
import { patchSearchParams, writeSession } from '../lib/session'
import { extensionForMime, pickAudioRecorderMime, stopMediaStream } from '../lib/voiceRecord'
import {
  clearDraft,
  emptyDraft,
  findCase,
  loadDraft,
  saveCase,
  saveDraft,
} from '../lib/storage'
import type { CaseRecord, CopilotResult, IncidentTypeId, ReportDraft } from '../types'

const paymentMethods = ['UPI', 'Bank transfer', 'Card', 'Wallet', 'Crypto', 'Other']

function voiceLanguage(language: string): CallLanguage {
  const base = language.split('-')[0]
  if (base === 'hi') return 'hi'
  if (base === 'en') return 'en'
  return 'auto'
}

function makeCaseId(): string {
  const number = Math.floor(10000 + Math.random() * 89999)
  return `${brand.casePrefix}-${number}`
}

function formatDateTime(value: string, locale: string, empty: string): string {
  if (!value) return empty
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function parseAmount(value: string): number {
  return Number(value.replace(/[^\d.]/g, '')) || 0
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-paper">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {children}
    </p>
  )
}

function SummaryRow({ label, value, empty }: { label: string; value: string; empty: string }) {
  return (
    <div className="grid gap-1 border-b border-black/[0.07] py-3 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <span className="text-sm leading-6 text-paper">{value || empty}</span>
    </div>
  )
}

function SuccessView({ record }: { record: CaseRecord }) {
  const { t } = useTranslation(['pages', 'common'])

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
      <div className="border-b border-black/[0.07] bg-mist px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-paper">{t('report.registered')}</h2>
      </div>

      <div className="p-5 sm:p-6">
        <label className="field-label">{t('report.ackNumber')}</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="flex-1 break-all rounded-lg border-2 border-brand/30 bg-field px-3.5 py-3 font-mono text-xl font-bold text-brand sm:text-2xl">
            {record.caseId}
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] bg-card px-3 py-2 text-xs font-semibold text-paper">
            <Clock3 className="h-3.5 w-3.5" /> {t('report.initialTriage')}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to={`/track?case=${encodeURIComponent(record.caseId)}`} className={buttonStyles('primary', 'lg')}>
            {t('report.trackThis')} <ArrowRight className="h-4 w-4" />
          </Link>
          <Button variant="secondary" size="lg" onClick={downloadAcknowledgement}>
            <Download className="h-4 w-4" /> {t('report.downloadAck')}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function ReportPage() {
  const { t, i18n } = useTranslation(['pages', 'common'])
  const steps = [
    { id: 1, label: t('report.steps.incident'), short: t('report.steps.incident') },
    { id: 2, label: t('report.steps.details'), short: t('report.steps.details') },
    { id: 3, label: t('report.steps.evidence'), short: t('report.steps.evidence') },
    { id: 4, label: t('report.steps.review'), short: t('report.steps.review') },
  ]
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedType = searchParams.get('type') as IncidentTypeId | null
  const isValidRequestedType = incidentTypes.some((item) => item.id === requestedType)
  const requestedAnonymous = searchParams.get('anonymous') === '1'
  const requestedEmergency = searchParams.get('mode') === 'emergency'
  const requestedSuspect = searchParams.get('suspect') ?? ''
  const requestedStory = searchParams.get('story') ?? ''
  const doneId = searchParams.get('done')
  const parsedStep = Number.parseInt(searchParams.get('step') || '1', 10)
  const step = Number.isFinite(parsedStep) ? Math.min(4, Math.max(1, parsedStep)) : 1

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
    if (requestedSuspect) {
      if (requestedType === 'financial') {
        next.recipientIdentifier = next.recipientIdentifier || requestedSuspect
      } else {
        next.suspiciousIdentifier = next.suspiciousIdentifier || requestedSuspect
      }
    }
    return next
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')
  const [savedLabel, setSavedLabel] = useState(() => t('report.draftReady'))
  const [submitting, setSubmitting] = useState(false)
  const [completedCase, setCompletedCase] = useState<CaseRecord | null>(() => {
    const id = new URLSearchParams(window.location.search).get('done')
    return id ? findCase(id) ?? null : null
  })
  const [copilotResult, setCopilotResult] = useState<CopilotResult | null>(null)
  const [listening, setListening] = useState(false)
  const [voiceBusy, setVoiceBusy] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const emergencyLanding = requestedEmergency && !draft.emergencyCaptured
  const [emergencyActionsReady, setEmergencyActionsReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const evidenceFilesRef = useRef<File[]>([])

  const selectedIncident = useMemo(
    () => incidentTypes.find((item) => item.id === draft.incidentType),
    [draft.incidentType],
  )

  function writeParams(patch: Record<string, string | null | undefined>, replace = false) {
    setSearchParams((current) => patchSearchParams(current, patch), { replace })
  }

  function goToStep(nextStep: number, replace = false) {
    writeParams({ step: String(nextStep), done: null, mode: null }, replace)
  }

  function openEmergency() {
    update('incidentType', 'financial')
    writeParams({ mode: 'emergency', done: null, type: 'financial' })
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveDraft(draft)
      setSavedLabel(t('report.savedLocally'))
    }, 280)
    setSavedLabel(t('report.saving'))
    return () => window.clearTimeout(timeout)
  }, [draft, t])

  useEffect(() => {
    if (doneId) {
      const found = findCase(doneId)
      if (found) setCompletedCase(found)
      return
    }
    setCompletedCase(null)
  }, [doneId])

  useEffect(() => {
    if (doneId || requestedEmergency) return
    if (!searchParams.get('step')) {
      writeParams({ step: '1' }, true)
    }
    // Initialise the step query once so browser back stays inside this report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void getFiles('report-evidence').then((files) => {
      evidenceFilesRef.current = files
      if (!files.length) return
      const names = files.map((file) => file.name)
      setDraft((current) => {
        if (current.evidenceNames.length) return current
        return {
          ...current,
          evidenceNames: names,
          evidenceItems: names.map(classifyEvidenceName),
        }
      })
    })
  }, [])

  function update<K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function runCopilot() {
    if (draft.copilotText.trim().length < 12) {
      setErrors((current) => ({ ...current, copilotText: t('report.copilotTooShort') }))
      return
    }
    const result = classifyIncident(draft.copilotText)
    setCopilotResult(result)
    setDraft((current) => ({
      ...current,
      incidentType: result.incidentType,
      description: current.description || current.copilotText,
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next.copilotText
      delete next.incidentType
      return next
    })
  }

  function releaseMic() {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }

  async function startVoice() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrors((current) => ({ ...current, copilotText: t('report.copilotVoiceUnsupported') }))
      return
    }

    setErrors((current) => {
      const next = { ...current }
      delete next.copilotText
      return next
    })

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = pickAudioRecorderMime()
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      streamRef.current = stream
      recorderRef.current = recorder
      recorder.start(250)
      setListening(true)
    } catch (error) {
      releaseMic()
      setListening(false)
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
      setErrors((current) => ({
        ...current,
        copilotText: denied ? t('report.copilotVoiceDenied') : t('report.copilotVoiceMic'),
      }))
    }
  }

  function stopVoice() {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      releaseMic()
      setListening(false)
      return
    }

    setListening(false)
    setVoiceBusy(true)
    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      releaseMic()
      void finishVoice(blob, type)
    }
    try {
      recorder.stop()
    } catch {
      releaseMic()
      setVoiceBusy(false)
    }
  }

  async function finishVoice(blob: Blob, type: string) {
    if (blob.size < 2000) {
      setVoiceBusy(false)
      setErrors((current) => ({ ...current, copilotText: t('report.copilotVoiceTooShort') }))
      return
    }

    const extension = extensionForMime(type)
    const file = new File([blob], `voice-complaint.${extension}`, { type })
    try {
      const transcript = await transcribeAudio(file, voiceLanguage(i18n.resolvedLanguage || 'en'))
      setDraft((current) => ({
        ...current,
        copilotText: `${current.copilotText}${current.copilotText ? ' ' : ''}${transcript}`.slice(0, 700),
      }))
    } catch (error) {
      setErrors((current) => ({
        ...current,
        copilotText: error instanceof Error ? error.message : t('report.copilotVoiceUnsupported'),
      }))
    } finally {
      setVoiceBusy(false)
    }
  }

  function toggleVoice() {
    if (voiceBusy) return
    if (listening) stopVoice()
    else void startVoice()
  }

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop()
        } catch {
          // Already closed.
        }
      }
      stopMediaStream(streamRef.current)
    }
  }, [])

  function validateCurrentStep(): boolean {
    const nextErrors: Record<string, string> = {}
    if (step === 1 && !draft.incidentType) {
      nextErrors.incidentType = t('report.errIncident')
    }
    if (step === 1 && draft.incidentType === 'other' && draft.otherIncident.trim().length < 8) {
      nextErrors.otherIncident = t('report.otherRequired')
    }
    if (step === 2) {
      if (!draft.occurredAt) nextErrors.occurredAt = t('report.errDate')
      if (!draft.state) nextErrors.state = t('report.errState')
      if (!draft.channel) nextErrors.channel = t('report.errChannel')
      if (draft.incidentType === 'financial' && !draft.amount.trim()) {
        nextErrors.amount = t('report.errAmount')
      }
      if (draft.incidentType === 'financial' && !draft.paymentMethod) {
        nextErrors.paymentMethod = t('report.errPayment')
      }
      if (draft.description.trim().length < 30) {
        nextErrors.description = t('report.errDescription')
      }
    }
    if (step === 4) {
      if (!draft.anonymous) {
        if (draft.fullName.trim().length < 2) nextErrors.fullName = t('report.errName')
        if (!/^\d{10}$/.test(draft.mobile.replace(/\s/g, ''))) {
          nextErrors.mobile = t('report.errMobile')
        }
      }
      if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
        nextErrors.email = t('report.errEmail')
      }
      if (!draft.consent) nextErrors.consent = t('report.errConsent')
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function nextStep() {
    if (!validateCurrentStep()) return
    goToStep(Math.min(4, step + 1))
  }

  function previousStep() {
    setErrors({})
    goToStep(Math.max(1, step - 1))
  }

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files)
    const oversized = list.find((file) => file.size > 5 * 1024 * 1024)
    if (oversized) {
      setFileError(t('report.fileTooBig', { name: oversized.name }))
      return
    }
    setFileError('')
    const incoming = Array.from(files)
    const merged = [...evidenceFilesRef.current]
    for (const file of incoming) {
      if (!merged.some((item) => item.name === file.name && item.size === file.size)) {
        merged.push(file)
      }
    }
    const nextFiles = merged.slice(0, 8)
    evidenceFilesRef.current = nextFiles
    void putFiles('report-evidence', nextFiles)
    const names = nextFiles.map((file) => file.name)
    setDraft((current) => ({
      ...current,
      evidenceNames: names,
      evidenceItems: names.map(classifyEvidenceName),
    }))
  }

  function validateEmergency(): boolean {
    const next: Record<string, string> = {}
    if (!draft.amount.trim()) next.amount = t('report.errEmergencyAmount')
    if (!draft.paymentMethod) next.paymentMethod = t('report.errEmergencyPayment')
    if (!draft.transactionId.trim()) next.transactionId = t('report.errEmergencyTxn')
    if (!draft.recipientIdentifier.trim()) next.recipientIdentifier = t('report.errEmergencyRecipient')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function captureEmergency() {
    if (!validateEmergency()) return
    const now = new Date()
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    setDraft((current) => ({
      ...current,
      incidentType: 'financial',
      occurredAt: current.occurredAt || local,
      channel: current.channel || (current.paymentMethod === 'UPI' ? 'UPI / payment app' : current.paymentMethod),
      description:
        current.description
        || `Financial fraud reported: ₹${current.amount} sent via ${current.paymentMethod}. Transaction ${current.transactionId}; recipient ${current.recipientIdentifier}.`,
      emergencyCaptured: true,
    }))
    setEmergencyActionsReady(false)
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    setEmergencyActionsReady(true)
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
    const isFinancial = draft.incidentType === 'financial'
    const amountNumber = parseAmount(draft.amount)
    const evidenceCount = draft.evidenceNames.length
    const evidenceLabel = `${evidenceCount} evidence item${evidenceCount === 1 ? '' : 's'}`
    const timeline = isFinancial
      ? [
          {
            label: 'Complaint received',
            detail: `${evidenceLabel} included with the complaint.`,
            timestamp: createdAt,
            status: 'done' as const,
          },
          {
            label: 'Financial fraud identified',
            detail: draft.emergencyCaptured
              ? 'Golden Minutes details already captured.'
              : 'Incident classified from the report details.',
            timestamp: createdAt,
            status: 'done' as const,
          },
          {
            label: 'Beneficiary bank notification',
            detail: 'A freeze request is generated from the captured transaction details.',
            timestamp: draft.emergencyCaptured ? createdAt : 'Current stage',
            status: draft.emergencyCaptured ? 'done' as const : 'active' as const,
          },
          {
            label: 'Transaction tracing',
            detail: 'Located funds are being reviewed for recovery.',
            timestamp: draft.emergencyCaptured ? 'Current stage' : 'Pending',
            status: draft.emergencyCaptured ? 'active' as const : 'pending' as const,
          },
          {
            label: 'Fund restoration review',
            detail: 'Lien-marked funds move to restoration after verification.',
            timestamp: 'Pending',
            status: 'pending' as const,
          },
        ]
      : [
          {
            label: 'Complaint submitted',
            detail: `${evidenceLabel} included with the complaint.`,
            timestamp: createdAt,
            status: 'done' as const,
          },
          {
            label: 'Initial triage',
            detail: 'Incident type and location are being checked.',
            timestamp: 'Current stage',
            status: 'active' as const,
          },
          {
            label: 'Jurisdiction assignment',
            detail: 'The relevant cyber cell receives the case next.',
            timestamp: 'Pending',
            status: 'pending' as const,
          },
          {
            label: 'Officer review',
            detail: 'Evidence review begins after assignment.',
            timestamp: 'Pending',
            status: 'pending' as const,
          },
        ]

    const record: CaseRecord = {
      caseId,
      createdAt,
      incidentType: draft.incidentType,
      state: draft.state || 'Not specified',
      description: draft.incidentType === 'other' && draft.otherIncident.trim()
        ? `${draft.otherIncident.trim()}. ${draft.description}`
        : draft.description,
      anonymous: draft.anonymous,
      progress: isFinancial ? 48 : 22,
      statusLabel: isFinancial
        ? 'Financial response initiated — tracing in progress'
        : 'Complaint received — initial triage',
      assignedUnit: isFinancial ? 'Financial Fraud Response Queue' : 'Assignment pending',
      nextAction: isFinancial ? 'Beneficiary tracing and lien review' : 'Jurisdiction assignment',
      amount: draft.amount,
      paymentMethod: draft.paymentMethod,
      transactionId: draft.transactionId,
      recipientIdentifier: draft.recipientIdentifier,
      evidenceCount,
      evidenceCompleteness: evidenceCompleteness(draft).score,
      recovery: isFinancial
        ? {
            reported: amountNumber,
            traced: Math.round(amountNumber * 0.76),
            lien: Math.round(amountNumber * 0.47),
            restorationEligible: Math.round(amountNumber * 0.47),
            stage: 'traced',
          }
        : undefined,
      timeline,
    }
    saveCase(record)
    writeSession('track', { caseId: record.caseId })
    setCompletedCase(record)
    setSubmitting(false)
    writeParams({ done: record.caseId, step: null, mode: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startOver() {
    clearDraft()
    void clearFiles('report-evidence')
    evidenceFilesRef.current = []
    setDraft({ ...emptyDraft })
    setCompletedCase(null)
    setErrors({})
    setCopilotResult(null)
    setEmergencyActionsReady(false)
    setSearchParams({ step: '1' }, { replace: true })
  }

  if (emergencyLanding && !completedCase) {
    return (
      <>
        <PageIntro title={t('report.emergency.title')} />
        <section className="page-shell pb-4">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-alert/20 bg-card shadow-card">
              <div className="flex items-center gap-3 bg-alert px-5 py-3.5 text-ink sm:px-6">
                <Zap className="h-4 w-4 shrink-0" />
                <p className="text-sm font-semibold">{t('report.emergency.help')}</p>
              </div>

              <div className="p-5 sm:p-7">
                {!draft.emergencyCaptured || !emergencyActionsReady ? (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="field-label" htmlFor="emergencyAmount">{t('report.emergency.amount')}</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">₹</span>
                          <input
                            id="emergencyAmount"
                            value={draft.amount}
                            onChange={(event) => update('amount', event.target.value)}
                            className="text-field pl-8"
                            placeholder="85,000"
                          />
                        </div>
                        <FieldError>{errors.amount}</FieldError>
                      </div>
                      <div>
                        <label className="field-label" htmlFor="emergencyMethod">{t('report.paymentMethod')}</label>
                        <div className="relative">
                          <select
                            id="emergencyMethod"
                            value={draft.paymentMethod}
                            onChange={(event) => update('paymentMethod', event.target.value)}
                            className="select-field"
                          >
                            <option value="">{t('report.chooseMethod')}</option>
                            {paymentMethods.map((method) => (
                              <option key={method}>{method}</option>
                            ))}
                          </select>
                          <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                        </div>
                        <FieldError>{errors.paymentMethod}</FieldError>
                      </div>
                      <div>
                        <label className="field-label" htmlFor="emergencyTxn">{t('report.transactionId')}</label>
                        <input
                          id="emergencyTxn"
                          value={draft.transactionId}
                          onChange={(event) => update('transactionId', event.target.value)}
                          className="text-field"
                          placeholder="412345678901"
                        />
                        <FieldError>{errors.transactionId}</FieldError>
                      </div>
                      <div>
                        <label className="field-label" htmlFor="emergencyRecipient">{t('report.recipient')}</label>
                        <input
                          id="emergencyRecipient"
                          value={draft.recipientIdentifier}
                          onChange={(event) => update('recipientIdentifier', event.target.value)}
                          className="text-field"
                          placeholder="merchant@upi"
                        />
                        <FieldError>{errors.recipientIdentifier}</FieldError>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="danger"
                        size="lg"
                        onClick={() => void captureEmergency()}
                        loading={draft.emergencyCaptured && !emergencyActionsReady}
                      >
                        <Zap className="h-4 w-4" /> {t('report.emergency.capture')}
                      </Button>
                      <a
                        href="tel:1930"
                        className={cx(buttonStyles('secondary', 'lg'), 'border-alert text-alert hover:border-alert')}
                      >
                        {t('report.emergency.callNow')}
                      </a>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          setSearchParams({ step: '1' }, { replace: true })
                        }}
                      >
                        {t('report.emergency.useNormal')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-2xl border border-brand/25 bg-brand/[0.04] p-5">
                      <p className="eyebrow text-brand">{t('report.emergency.package')}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          t('report.emergency.created'),
                          t('report.emergency.details'),
                          t('report.emergency.bank'),
                          t('report.emergency.freeze'),
                          t('report.emergency.evidence'),
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-card p-3 text-sm font-medium text-paper"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand">
                              <Check className="h-3 w-3 text-ink" />
                            </span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Button
                        size="lg"
                        onClick={() => {
                          writeParams({ mode: null, step: '3' })
                        }}
                      >
                        {t('report.emergency.addEvidence')} <ArrowRight className="h-4 w-4" />
                      </Button>
                      <a href="tel:1930" className={buttonStyles('danger', 'lg')}>
                        {t('actions.call1930', { ns: 'common' })}
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageIntro title={t('report.eyebrow')} />

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
              <div className="border-b border-black/[0.07] px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <ol className="flex min-w-0 flex-1 items-start">
                    {steps.map((item, index) => {
                      const active = item.id === step
                      const done = item.id < step
                      return (
                        <li key={item.id} className="flex min-w-0 flex-1 items-start">
                          {index > 0 ? (
                            <span className={cx('mt-[0.45rem] h-px min-w-2 flex-1', done || active ? 'bg-brand' : 'bg-black/15')} />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => done && goToStep(item.id)}
                            disabled={!done}
                            aria-current={active ? 'step' : undefined}
                            className="flex w-[3.6rem] shrink-0 flex-col items-center gap-1 sm:w-[4.4rem]"
                          >
                            <span
                              className={cx(
                                'flex h-4 w-4 items-center justify-center rounded-full transition',
                                active && 'bg-brand ring-2 ring-brand/25',
                                done && 'bg-brand',
                                !active && !done && 'border border-black/20 bg-card',
                              )}
                            >
                              {done ? <Check className="h-2.5 w-2.5 text-ink" /> : null}
                            </span>
                            <span className={cx(
                              'text-center text-[0.62rem] leading-tight',
                              active ? 'font-semibold text-paper' : 'text-muted',
                            )}>
                              {item.short}
                            </span>
                          </button>
                          {index < steps.length - 1 ? (
                            <span className={cx('mt-[0.45rem] h-px min-w-2 flex-1', item.id < step ? 'bg-brand' : 'bg-black/15')} />
                          ) : null}
                        </li>
                      )
                    })}
                  </ol>
                  <p className="hidden shrink-0 text-[0.65rem] text-muted sm:block">{savedLabel}</p>
                </div>
              </div>
              {draft.emergencyCaptured ? (
                <p className="border-b border-black/[0.07] px-5 py-1.5 text-[0.7rem] font-medium text-brand sm:px-6">
                  {t('report.emergency.banner')}
                </p>
              ) : null}

              <div className="p-5 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div key="step-1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-paper">{t('report.step1Title')}</h2>

                      <div className="mt-5">
                        <label htmlFor="copilot" className="field-label">{t('report.copilotLabel')}</label>
                        <textarea
                          id="copilot"
                          value={draft.copilotText}
                          onChange={(event) => update('copilotText', event.target.value.slice(0, 700))}
                          className="text-area min-h-28"
                          placeholder={t('home.copilot.placeholder')}
                        />
                        <p className="mt-2 text-xs leading-5 text-muted">
                          {voiceBusy ? t('report.copilotVoiceTranscribing') : listening ? t('report.copilotVoiceHint') : t('report.copilotHelp')}
                        </p>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Button type="button" size="sm" onClick={runCopilot} disabled={listening || voiceBusy}>
                            <Sparkles className="h-4 w-4" /> {t('report.copilotClassify')}
                          </Button>
                          <Button
                            type="button"
                            variant={listening ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={toggleVoice}
                            loading={voiceBusy}
                            aria-pressed={listening}
                          >
                            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            {listening ? t('report.copilotVoiceStop') : t('report.copilotVoice')}
                          </Button>
                        </div>
                        <FieldError>{errors.copilotText}</FieldError>

                        {copilotResult ? (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-black/[0.08] bg-card p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand">
                                  {copilotResult.severity} · {copilotResult.route}
                                </p>
                                <p className="mt-1 text-base font-semibold text-paper">{copilotResult.label}</p>
                                <p className="mt-2 text-sm text-muted">{copilotResult.signals.join(' · ')}</p>
                              </div>
                              {copilotResult.incidentType === 'financial' ? (
                                <Button type="button" variant="danger" size="sm" onClick={openEmergency}>
                                  {t('report.openEmergency')}
                                </Button>
                              ) : null}
                            </div>
                          </motion.div>
                        ) : null}
                      </div>

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
                                'flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition',
                                active
                                  ? 'border-brand bg-brand/[0.06] shadow-[inset_0_0_0_1px_rgba(22,104,207,.12)]'
                                  : 'border-fieldBorder bg-field hover:border-brand/50 hover:bg-card',
                              )}
                            >
                              <span
                                className={cx(
                                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                                  active ? 'border-brand bg-brand' : 'border-fieldBorder bg-card',
                                )}
                                aria-hidden
                              >
                                {active ? <Check className="h-3 w-3 text-ink" /> : null}
                              </span>
                              <span>
                                <span className={cx('block text-[0.95rem] font-semibold', active ? 'text-brand' : 'text-paper')}>
                                  {t(`incidents.${incident.id}.title`)}
                                </span>
                                <span className="mt-0.5 block text-sm leading-5 text-muted">{t(`incidents.${incident.id}.description`)}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <FieldError>{errors.incidentType}</FieldError>

                      {draft.incidentType === 'other' ? (
                        <div className="mt-5">
                          <label className="field-label" htmlFor="otherIncident">{t('report.otherLabel')}</label>
                          <textarea
                            id="otherIncident"
                            value={draft.otherIncident}
                            onChange={(event) => update('otherIncident', event.target.value.slice(0, 240))}
                            className="text-area min-h-24"
                            placeholder={t('report.otherPlaceholder')}
                          />
                          <p className="field-help">{t('report.otherHelp')}</p>
                          <FieldError>{errors.otherIncident}</FieldError>
                        </div>
                      ) : null}

                      {draft.incidentType === 'financial' ? (
                        <div className="mt-5 rounded-xl bg-alert p-4 text-ink sm:flex sm:items-center sm:justify-between sm:gap-5">
                          <div>
                            <p className="text-sm font-semibold">{t('report.moneyMoved')}</p>
                            <p className="mt-1 text-sm leading-6 text-white/75">{t('report.moneyMovedHelp')}</p>
                          </div>
                          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
                            <Button type="button" variant="secondary" size="sm" onClick={openEmergency}>
                              {t('home.lostMoney')}
                            </Button>
                            <a
                              href="tel:1930"
                              className="inline-flex h-9 items-center rounded-lg bg-white px-3.5 text-sm font-semibold text-alert hover:bg-white/90"
                            >
                              {t('report.callNow')}
                            </a>
                          </div>
                        </div>
                      ) : null}

                      {draft.incidentType === 'women-child' ? (
                        <div className="mt-5 rounded-xl border-2 border-fieldBorder bg-field p-4">
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
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-paper">{t('report.step2Title')}</h2>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="field-label" htmlFor="occurredAt">{t('report.occurredAt')}</label>
                          <input
                            id="occurredAt"
                            type="datetime-local"
                            value={draft.occurredAt}
                            onChange={(event) => update('occurredAt', event.target.value)}
                            className="text-field"
                          />
                          <FieldError>{errors.occurredAt}</FieldError>
                        </div>
                        <div>
                          <label className="field-label" htmlFor="state">{t('report.state')}</label>
                          <div className="relative">
                            <select id="state" value={draft.state} onChange={(event) => update('state', event.target.value)} className="select-field">
                              <option value="">{t('report.chooseLocation')}</option>
                              {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                          </div>
                          <FieldError>{errors.state}</FieldError>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="field-label" htmlFor="channel">{t('report.channel')}</label>
                          <div className="relative">
                            <select id="channel" value={draft.channel} onChange={(event) => update('channel', event.target.value)} className="select-field">
                              <option value="">{t('report.chooseChannel')}</option>
                              {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                          </div>
                          <FieldError>{errors.channel}</FieldError>
                        </div>

                        {draft.incidentType === 'financial' ? (
                          <>
                            <div>
                              <label className="field-label" htmlFor="amount">{t('report.amount')}</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">₹</span>
                                <input id="amount" value={draft.amount} onChange={(event) => update('amount', event.target.value)} className="text-field pl-8" placeholder="24,500" />
                              </div>
                              <FieldError>{errors.amount}</FieldError>
                            </div>
                            <div>
                              <label className="field-label" htmlFor="paymentMethod">{t('report.paymentMethod')}</label>
                              <div className="relative">
                                <select
                                  id="paymentMethod"
                                  value={draft.paymentMethod}
                                  onChange={(event) => update('paymentMethod', event.target.value)}
                                  className="select-field"
                                >
                                  <option value="">{t('report.chooseMethod')}</option>
                                  {paymentMethods.map((method) => (
                                    <option key={method}>{method}</option>
                                  ))}
                                </select>
                                <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                              </div>
                              <FieldError>{errors.paymentMethod}</FieldError>
                            </div>
                            <div>
                              <label className="field-label" htmlFor="transactionId">{t('report.transactionId')} <span className="font-normal text-muted">{t('report.optional')}</span></label>
                              <input id="transactionId" value={draft.transactionId} onChange={(event) => update('transactionId', event.target.value)} className="text-field" placeholder="412345678901" />
                            </div>
                            <div>
                              <label className="field-label" htmlFor="recipientIdentifier">{t('report.recipient')}</label>
                              <input
                                id="recipientIdentifier"
                                value={draft.recipientIdentifier}
                                onChange={(event) => update('recipientIdentifier', event.target.value)}
                                className="text-field"
                                placeholder="merchant@upi"
                              />
                              <FieldError>{errors.recipientIdentifier}</FieldError>
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
                            placeholder={t('report.descriptionPlaceholder')}
                          />
                          <p className="field-help">{t('report.sensitiveHelp')}</p>
                          <FieldError>{errors.description}</FieldError>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {step === 3 ? (
                    <motion.div key="step-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-paper">{t('report.step3Title')}</h2>

                      <div
                        className="drop-zone mt-5"
                        onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                        onDrop={(event: DragEvent<HTMLDivElement>) => {
                          event.preventDefault()
                          addFiles(event.dataTransfer.files)
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            fileInputRef.current?.click()
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <Plus className="mx-auto h-8 w-8 text-brand" />
                        <h3 className="mt-3 text-base font-semibold text-paper">{t('report.evidenceDrop')}</h3>
                        <p className="mt-1 text-sm text-muted">{t('report.evidenceTypes')}</p>
                        <div className="mt-4 flex justify-center">
                          <span className={cx(buttonStyles('secondary', 'sm'), 'pointer-events-none')}>
                            <Plus className="h-4 w-4" /> {t('report.chooseFiles')}
                          </span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,application/pdf,text/plain"
                          className="sr-only"
                          onClick={(event) => event.stopPropagation()}
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
                                  <p className="mt-0.5 font-mono text-[0.57rem] uppercase tracking-[0.12em] text-muted">{t('report.attached')}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const names = draft.evidenceNames.filter((_, itemIndex) => itemIndex !== index)
                                  evidenceFilesRef.current = evidenceFilesRef.current.filter((_, itemIndex) => itemIndex !== index)
                                  void putFiles('report-evidence', evidenceFilesRef.current)
                                  setDraft((current) => ({
                                    ...current,
                                    evidenceNames: names,
                                    evidenceItems: names.map(classifyEvidenceName),
                                  }))
                                }}
                                className="rounded-lg p-2 text-muted hover:bg-alert/[0.08] hover:text-alert"
                                aria-label={t('report.removeFile', { name })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-4 text-xs leading-5 text-muted">
                        {t('report.evidenceKeep')}
                      </p>
                    </motion.div>
                  ) : null}

                  {step === 4 ? (
                    <motion.div key="step-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-paper">{t('report.step4Title')}</h2>

                      {!draft.anonymous ? (
                        <div className="mt-5 rounded-xl border-2 border-fieldBorder bg-field p-4 sm:p-5">
                          <h3 className="mb-4 text-sm font-semibold text-paper">{t('report.contactDetails')}</h3>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <label className="field-label" htmlFor="fullName">{t('report.fullName')}</label>
                              <input id="fullName" value={draft.fullName} onChange={(event) => update('fullName', event.target.value)} className="text-field" placeholder={t('report.fullNamePlaceholder')} />
                              <FieldError>{errors.fullName}</FieldError>
                            </div>
                            <div>
                              <label className="field-label" htmlFor="mobile">{t('report.mobile')}</label>
                              <input id="mobile" inputMode="numeric" value={draft.mobile} onChange={(event) => update('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))} className="text-field" placeholder="9000001930" />
                              <FieldError>{errors.mobile}</FieldError>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="field-label" htmlFor="email">{t('report.email')} <span className="font-normal text-muted">{t('report.optional')}</span></label>
                              <input id="email" type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} className="text-field" placeholder="aarav@example.com" />
                              <FieldError>{errors.email}</FieldError>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 rounded-xl border border-black/[0.08] p-5">
                          <p className="text-sm font-medium text-paper">{t('report.anonymousSelected')}</p>
                          <p className="mt-1 text-sm leading-6 text-muted">{t('report.anonymousSelectedHelp')}</p>
                        </div>
                      )}

                      <div className="mt-5 surface-soft p-5 sm:p-6">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <h3 className="text-base font-semibold text-paper">{t('report.summary')}</h3>
                          <button type="button" onClick={() => goToStep(1)} className="link-accent text-xs">{t('report.edit')}</button>
                        </div>
                        <SummaryRow label={t('report.summaryIncident')} value={selectedIncident ? t(`incidents.${selectedIncident.id}.title`) : ''} empty={t('report.notAdded')} />
                        {draft.incidentType === 'other' ? (
                          <SummaryRow label={t('report.summaryType')} value={draft.otherIncident} empty={t('report.notAdded')} />
                        ) : null}
                        <SummaryRow label={t('report.summaryOccurred')} value={formatDateTime(draft.occurredAt, i18n.language, t('report.notAdded'))} empty={t('report.notAdded')} />
                        <SummaryRow label={t('report.summaryLocation')} value={draft.state} empty={t('report.notAdded')} />
                        <SummaryRow label={t('report.summaryChannel')} value={draft.channel} empty={t('report.notAdded')} />
                        {draft.incidentType === 'financial' ? (
                          <>
                            <SummaryRow label={t('report.summaryAmount')} value={draft.amount ? `₹${draft.amount}` : ''} empty={t('report.notAdded')} />
                            <SummaryRow label={t('report.summaryPayment')} value={draft.paymentMethod} empty={t('report.notAdded')} />
                            <SummaryRow label={t('report.summaryTransaction')} value={draft.transactionId} empty={t('report.notAdded')} />
                            <SummaryRow label={t('report.summaryRecipient')} value={draft.recipientIdentifier} empty={t('report.notAdded')} />
                          </>
                        ) : null}
                        <SummaryRow
                          label={t('report.summaryEvidence')}
                          value={draft.evidenceNames.length ? t('report.evidenceFiles', { count: draft.evidenceNames.length }) : t('report.noFiles')}
                          empty={t('report.notAdded')}
                        />
                        <SummaryRow label={t('report.summaryDescription')} value={draft.description} empty={t('report.notAdded')} />
                      </div>

                      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-fieldBorder bg-field p-4 hover:border-brand/50">
                        <input
                          type="checkbox"
                          checked={draft.consent}
                          onChange={(event) => update('consent', event.target.checked)}
                          className="mt-1 h-4 w-4 accent-brand"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-paper">{t('report.consent')}</span>
                          <span className="mt-1 block text-xs leading-5 text-muted">{t('report.consentHelp')}</span>
                        </span>
                      </label>
                      <FieldError>{errors.consent}</FieldError>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" size="lg" onClick={previousStep} disabled={step === 1}>
                    <ArrowLeft className="h-4 w-4" /> {t('actions.back', { ns: 'common' })}
                  </Button>
                  {step < 4 ? (
                    <Button size="lg" onClick={nextStep}>
                      {t('actions.continue', { ns: 'common' })} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="lg" onClick={submitReport} loading={submitting}>
                      <ShieldCheck className="h-4 w-4" /> {t('report.submit')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="surface-soft p-4">
                <p className="text-sm font-medium text-paper">{t('report.includeTitle')}</p>
                {selectedIncident ? (
                  <p className="mt-2 text-sm leading-5 text-muted">{t(`incidents.${selectedIncident.id}.hint`)}</p>
                ) : null}
                <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
                  <li>{t('report.include1')}</li>
                  <li>{t('report.include2')}</li>
                  <li>{t('report.include3')}</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-alert p-5 text-ink">
                <p className="text-sm font-semibold">{t('home.lostMoney')}</p>
                <p className="mt-2 text-xs leading-5 text-white/75">{t('report.moneyMovedHelp')}</p>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={openEmergency}
                    className="flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90"
                  >
                    <Zap className="mr-2 h-4 w-4" /> {t('home.lostMoney')}
                  </button>
                  <a
                    href="tel:1930"
                    className="flex h-9 w-full items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    {t('actions.call1930', { ns: 'common' })}
                  </a>
                </div>
              </div>

            </aside>
          </div>
        )}
      </section>
    </>
  )
}
