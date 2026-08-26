import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FileSearch,
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
import {
  buildIncidentTimeline,
  classifyEvidenceName,
  classifyIncident,
  evidenceCompleteness,
  extractEvidence,
  getActionPlan,
} from '../lib/intelligence'
import { clearDraft, emptyDraft, loadDraft, saveCase, saveDraft } from '../lib/storage'
import type { CaseRecord, CopilotResult, IncidentTypeId, ReportDraft } from '../types'

const steps = [
  { id: 1, label: 'What happened', short: 'Incident' },
  { id: 2, label: 'Tell us the details', short: 'Details' },
  { id: 3, label: 'Add evidence', short: 'Evidence' },
  { id: 4, label: 'Review and submit', short: 'Review' },
]

const paymentMethods = ['UPI', 'Bank transfer', 'Card', 'Wallet', 'Crypto', 'Other']

function makeCaseId(): string {
  const number = Math.floor(10000 + Math.random() * 89999)
  return `${brand.casePrefix}-${number}`
}

function formatDateTime(value: string): string {
  if (!value) return 'Not added'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function parseAmount(value: string): number {
  return Number(value.replace(/[^\d.]/g, '')) || 0
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-alert"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {children}</p>
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-black/[0.07] py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <span className="text-sm leading-6 text-paper">{value || 'Not added'}</span>
    </div>
  )
}

function SuccessView({ record }: { record: CaseRecord }) {
  const actions = getActionPlan(record.incidentType)

  function downloadAcknowledgement() {
    const content = [
      `${brand.name.toUpperCase()} — DEMO ACKNOWLEDGEMENT`,
      `${brand.disclaimer} No government, bank or police system was contacted.`,
      '',
      `Reference: ${record.caseId}`,
      `Created: ${record.createdAt}`,
      `Status: ${record.statusLabel}`,
      `State: ${record.state}`,
      `Incident type: ${record.incidentType}`,
      record.amount ? `Reported amount: ₹${record.amount}` : '',
      record.transactionId ? `Transaction ID: ${record.transactionId}` : '',
      '',
      'NEXT ACTIONS',
      ...actions.map((item, index) => `${index + 1}. ${item}`),
      '',
      'Keep this fictional reference to test the Track Complaint journey.',
    ].filter(Boolean).join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${record.caseId}-summary.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
      <div className="secure-hero px-6 py-8 text-white sm:px-8 sm:py-10">
        <p className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.14em] text-white/65">Demo complaint created · locally sealed</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Complaint captured. Recovery visibility starts here.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Synthetic acknowledgement only. No live portal, police system, bank, 1930 service or government integration was contacted.</p>
      </div>

      <div className="p-5 sm:p-7">
        <div className="surface-soft p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow">Demo acknowledgement number</p>
            <p className="mt-2 break-all font-mono text-xl font-bold text-brand sm:text-2xl">{record.caseId}</p>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-white px-3 py-2 text-xs font-semibold text-paper sm:mt-0">
            <Clock3 className="h-3.5 w-3.5 text-brand" /> Initial response simulated
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['01', 'Reference generated', 'Use this ID in Track Complaint'],
            ['02', 'Evidence organized', `${record.evidenceCount ?? 0} items · ${record.evidenceCompleteness ?? 0}% complete`],
            ['03', 'Next stage visible', record.nextAction ?? 'Timeline update'],
          ].map(([number, label, detail]) => (
            <div key={number} className="rounded-xl border border-black/[0.07] p-4">
              <span className="font-mono text-xs font-bold text-brand">{number}</span>
              <p className="mt-2 text-sm font-semibold text-paper">{label}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-brand/20 bg-brand/[0.035] p-5">
          <p className="eyebrow text-brand">Specific next-action plan</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {actions.map((item, index) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-muted"><span className="font-mono text-xs font-bold text-brand">0{index + 1}</span>{item}</li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to={`/track?case=${encodeURIComponent(record.caseId)}`} className={buttonStyles('primary', 'lg')}>Track complaint <ArrowRight className="h-4 w-4" /></Link>
          <Button variant="secondary" size="lg" onClick={downloadAcknowledgement}><Download className="h-4 w-4" /> Download summary</Button>
          <Link to="/learn#safety" className={buttonStyles('secondary', 'lg')}>View next steps</Link>
        </div>
      </div>
    </motion.div>
  )
}

export function ReportPage() {
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type') as IncidentTypeId | null
  const isValidRequestedType = incidentTypes.some((item) => item.id === requestedType)
  const requestedAnonymous = searchParams.get('anonymous') === '1'
  const requestedEmergency = searchParams.get('mode') === 'emergency'
  const requestedSuspect = searchParams.get('suspect') ?? ''
  const requestedStory = searchParams.get('story') ?? ''

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<ReportDraft>(() => {
    const saved = loadDraft()
    const initial = {
      ...saved,
      incidentType: isValidRequestedType ? requestedType! : saved.incidentType,
      anonymous: requestedType === 'women-child' ? requestedAnonymous : saved.anonymous,
    }
    if (requestedStory) {
      initial.copilotText = initial.copilotText || requestedStory
      initial.description = initial.description || requestedStory
    }
    if (requestedSuspect) {
      if (requestedType === 'financial') initial.recipientIdentifier = initial.recipientIdentifier || requestedSuspect
      else initial.suspiciousIdentifier = initial.suspiciousIdentifier || requestedSuspect
    }
    return initial
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')
  const [savedLabel, setSavedLabel] = useState('Draft ready')
  const [submitting, setSubmitting] = useState(false)
  const [completedCase, setCompletedCase] = useState<CaseRecord | null>(null)
  const [copilotResult, setCopilotResult] = useState<CopilotResult | null>(null)
  const [listening, setListening] = useState(false)
  const [emergencyLanding, setEmergencyLanding] = useState(requestedEmergency && !draft.emergencyCaptured)
  const [emergencyActionsReady, setEmergencyActionsReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedIncident = useMemo(() => incidentTypes.find((item) => item.id === draft.incidentType), [draft.incidentType])
  const completeness = useMemo(() => evidenceCompleteness(draft), [draft])
  const extracted = useMemo(() => extractEvidence(draft), [draft])
  const incidentTimeline = useMemo(() => buildIncidentTimeline(draft), [draft])
  const actionPlan = draft.incidentType ? getActionPlan(draft.incidentType) : []

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

  function runCopilot() {
    if (draft.copilotText.trim().length < 12) {
      setErrors((current) => ({ ...current, copilotText: 'Describe the incident in a little more detail.' }))
      return
    }
    const result = classifyIncident(draft.copilotText)
    setCopilotResult(result)
    setDraft((current) => ({
      ...current,
      incidentType: result.incidentType,
      description: current.description || current.copilotText,
    }))
    setErrors((current) => ({ ...current, copilotText: '' }))
  }

  function startVoice() {
    const browser = window as any
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition
    if (!Recognition) {
      setErrors((current) => ({ ...current, copilotText: 'Voice input is not supported in this browser. You can type the incident instead.' }))
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      if (transcript) update('copilotText', `${draft.copilotText}${draft.copilotText ? ' ' : ''}${transcript}`)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  function validateCurrentStep(): boolean {
    const nextErrors: Record<string, string> = {}
    if (step === 1 && !draft.incidentType) nextErrors.incidentType = 'Choose the option that best matches what happened.'
    if (step === 2) {
      if (!draft.occurredAt) nextErrors.occurredAt = 'Add the approximate date and time.'
      if (!draft.state) nextErrors.state = 'Choose the state or union territory of the incident.'
      if (!draft.channel) nextErrors.channel = 'Choose where the incident happened.'
      if (draft.incidentType === 'financial') {
        if (!draft.amount.trim()) nextErrors.amount = 'Add the amount involved, even if approximate.'
        if (!draft.paymentMethod) nextErrors.paymentMethod = 'Choose how the money was sent.'
        if (!draft.recipientIdentifier.trim()) nextErrors.recipientIdentifier = 'Add the recipient UPI/account/phone if available.'
      }
      if (draft.incidentType === 'account' && !draft.accountPlatform) nextErrors.accountPlatform = 'Add the affected platform.'
      if (draft.incidentType === 'suspicious-content' && !draft.suspiciousIdentifier) nextErrors.suspiciousIdentifier = 'Add the suspicious phone, URL, email or UPI ID.'
      if (draft.description.trim().length < 30) nextErrors.description = 'Add at least 30 characters so the sequence is understandable.'
    }
    if (step === 4) {
      if (!draft.anonymous) {
        if (draft.fullName.trim().length < 2) nextErrors.fullName = 'Add a fictional demo name.'
        if (!/^\d{10}$/.test(draft.mobile.replace(/\s/g, ''))) nextErrors.mobile = 'Use a 10-digit fictional demo number.'
      }
      if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) nextErrors.email = 'Use a valid fictional email format.'
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
    const names = Array.from(new Set([...draft.evidenceNames, ...list.map((file) => file.name)])).slice(0, 8)
    setDraft((current) => ({ ...current, evidenceNames: names, evidenceItems: names.map(classifyEvidenceName) }))
  }

  function addDemoEvidence() {
    const names = Array.from(new Set([
      ...draft.evidenceNames,
      'whatsapp-investment-chat.png',
      'upi-transaction-proof.png',
      'suspect-profile.png',
    ])).slice(0, 8)
    setDraft((current) => ({ ...current, evidenceNames: names, evidenceItems: names.map(classifyEvidenceName) }))
    setFileError('')
  }

  function removeEvidence(index: number) {
    const names = draft.evidenceNames.filter((_, itemIndex) => itemIndex !== index)
    setDraft((current) => ({ ...current, evidenceNames: names, evidenceItems: names.map(classifyEvidenceName) }))
  }

  function fillDemoDetails() {
    const now = new Date()
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    setDraft((current) => {
      const common = { ...current, occurredAt: local, state: current.state || 'Karnataka' }
      if (current.incidentType === 'financial') {
        return {
          ...common,
          channel: 'WhatsApp / Telegram',
          amount: '85,000',
          paymentMethod: 'UPI',
          transactionId: 'DEMO-UPI-42384021',
          recipientIdentifier: 'refunddesk@upi',
          platform: 'WhatsApp / Telegram',
          remoteAccessAsked: 'no',
          description: 'I received a WhatsApp message from someone claiming to represent a stock-investment company. I joined a Telegram group and transferred ₹85,000 through UPI. The person later stopped responding.',
        }
      }
      if (current.incidentType === 'account') {
        return { ...common, channel: 'Instagram / Facebook / social media', accountPlatform: 'Instagram', stillHasAccess: 'no', contactChanged: 'yes', description: 'My fictional Instagram account stopped accepting my password. The recovery email appears to have been changed and unknown messages were sent from the account.' }
      }
      return { ...common, channel: 'WhatsApp / Telegram', suspiciousIdentifier: current.suspiciousIdentifier || '9876543210', harassmentHandle: '@demo-account', description: 'A fictional demo incident occurred through repeated messages from an unknown account. I saved the account identifier, timestamps and screenshots before blocking it.' }
    })
  }

  function validateEmergency(): boolean {
    const next: Record<string, string> = {}
    if (!draft.amount.trim()) next.amount = 'Add the amount lost.'
    if (!draft.paymentMethod) next.paymentMethod = 'Choose how you sent the money.'
    if (!draft.transactionId.trim()) next.transactionId = 'Add the transaction ID for the demo flow.'
    if (!draft.recipientIdentifier.trim()) next.recipientIdentifier = 'Add the recipient UPI/account/phone.'
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
      description: current.description || `Financial fraud reported: ₹${current.amount} sent via ${current.paymentMethod}. Transaction ${current.transactionId}; recipient ${current.recipientIdentifier}.`,
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
    const createdAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
    const isFinancial = draft.incidentType === 'financial'
    const amountNumber = parseAmount(draft.amount)
    const evidenceScore = completeness.score
    const timeline = isFinancial
      ? [
          { label: 'Complaint received', detail: `${draft.evidenceNames.length} evidence item${draft.evidenceNames.length === 1 ? '' : 's'} sealed in the local demo package.`, timestamp: 'Now', status: 'done' as const },
          { label: 'Financial fraud identified', detail: draft.emergencyCaptured ? 'Golden Minutes details already captured.' : 'Incident classified from the report details.', timestamp: '+2 min', status: 'done' as const },
          { label: 'Beneficiary bank notification', detail: 'A simulated freeze/lien request is generated in this prototype.', timestamp: '+5 min', status: draft.emergencyCaptured ? 'done' as const : 'active' as const },
          { label: 'Transaction tracing', detail: 'Synthetic tracing will show a partial amount located for the demo.', timestamp: 'Current', status: draft.emergencyCaptured ? 'active' as const : 'pending' as const },
          { label: 'Fund restoration review', detail: 'Lien-marked funds would move to restoration review after verification.', timestamp: 'Next', status: 'pending' as const },
        ]
      : [
          { label: 'Complaint submitted', detail: `${draft.evidenceNames.length} evidence item${draft.evidenceNames.length === 1 ? '' : 's'} included in the demo package.`, timestamp: createdAt, status: 'done' as const },
          { label: 'Initial triage', detail: 'Incident type, urgency and location are being checked.', timestamp: 'Current stage', status: 'active' as const },
          { label: 'Jurisdiction assignment', detail: 'The relevant cyber cell would receive the case next.', timestamp: 'Pending', status: 'pending' as const },
          { label: 'Officer review', detail: 'Evidence review would begin after assignment.', timestamp: 'Pending', status: 'pending' as const },
        ]

    const record: CaseRecord = {
      caseId,
      createdAt,
      incidentType: draft.incidentType,
      state: draft.state || 'Not specified',
      description: draft.description,
      anonymous: draft.anonymous,
      progress: isFinancial ? 48 : 22,
      statusLabel: isFinancial ? 'Financial response initiated — tracing simulated' : 'Complaint received — initial triage',
      assignedUnit: isFinancial ? 'Demo Financial Fraud Response Queue' : 'Assignment pending (demo)',
      nextAction: isFinancial ? 'Beneficiary tracing and lien review' : 'Jurisdiction assignment',
      amount: draft.amount,
      paymentMethod: draft.paymentMethod,
      transactionId: draft.transactionId,
      recipientIdentifier: draft.recipientIdentifier,
      evidenceCount: draft.evidenceNames.length,
      evidenceCompleteness: evidenceScore,
      recovery: isFinancial ? {
        reported: amountNumber,
        traced: Math.round(amountNumber * 0.76),
        lien: Math.round(amountNumber * 0.47),
        restorationEligible: Math.round(amountNumber * 0.47),
        stage: 'traced',
      } : undefined,
      timeline,
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
    setCopilotResult(null)
    setEmergencyLanding(false)
  }

  const progress = (step / steps.length) * 100

  if (emergencyLanding && !completedCase) {
    return (
      <>
        <PageIntro
          eyebrow="Golden Minutes · financial emergency"
          title="I just lost money."
          description="Skip the long form. Capture the four transaction details that matter first, call 1930, then preserve evidence. All response actions shown here are simulated."
          aside="Prototype only. No bank, police or 1930 API is contacted."
        />
        <section className="page-shell pb-4">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-alert/20 bg-white shadow-card">
              <div className="bg-alert px-5 py-5 text-white sm:px-7">
                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/65">Emergency mode</p>
                    <h2 className="mt-1 text-xl font-semibold sm:text-2xl">Time saved can mean money saved.</h2>
                    <p className="mt-2 text-sm leading-6 text-white/75">Call 1930 immediately. While you do that, capture the transaction below.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {!draft.emergencyCaptured || !emergencyActionsReady ? (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="field-label" htmlFor="emergencyAmount">How much did you lose?</label>
                        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">₹</span><input id="emergencyAmount" value={draft.amount} onChange={(event) => update('amount', event.target.value)} className="text-field pl-8" placeholder="85,000" /></div>
                        <FieldError>{errors.amount}</FieldError>
                      </div>
                      <div>
                        <label className="field-label" htmlFor="emergencyMethod">How did you send it?</label>
                        <div className="relative"><select id="emergencyMethod" value={draft.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} className="select-field"><option value="">Choose method</option>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div>
                        <FieldError>{errors.paymentMethod}</FieldError>
                      </div>
                      <div>
                        <label className="field-label" htmlFor="emergencyTxn">Transaction ID</label>
                        <input id="emergencyTxn" value={draft.transactionId} onChange={(event) => update('transactionId', event.target.value)} className="text-field" placeholder="DEMO-UPI-42384021" />
                        <FieldError>{errors.transactionId}</FieldError>
                      </div>
                      <div>
                        <label className="field-label" htmlFor="emergencyRecipient">Recipient UPI / account / phone</label>
                        <input id="emergencyRecipient" value={draft.recipientIdentifier} onChange={(event) => update('recipientIdentifier', event.target.value)} className="text-field" placeholder="merchant@upi" />
                        <FieldError>{errors.recipientIdentifier}</FieldError>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button variant="danger" size="lg" onClick={() => void captureEmergency()} loading={draft.emergencyCaptured && !emergencyActionsReady}><Zap className="h-4 w-4" /> Capture critical details</Button>
                      <a href="tel:1930" className={cx(buttonStyles('secondary', 'lg'), 'border-alert text-alert hover:border-alert')}>Call 1930 now</a>
                      <Button variant="ghost" size="lg" onClick={() => { setEmergencyLanding(false); setStep(1) }}>Use normal report</Button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-2xl border border-brand/25 bg-brand/[0.04] p-5">
                      <p className="eyebrow text-brand">Emergency response package · simulated</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          'Financial fraud report created',
                          'Transaction details captured',
                          'Beneficiary bank identified',
                          'Freeze request generated',
                          'Evidence preservation started',
                        ].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white p-3 text-sm font-medium text-paper"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand"><Check className="h-3 w-3 text-white" /></span>{item}</div>)}
                      </div>
                      <p className="mt-4 text-xs leading-5 text-muted">These actions are visual simulation only. No bank, police or government system has been contacted.</p>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Button size="lg" onClick={() => { setEmergencyLanding(false); setStep(3) }}>Add evidence <ArrowRight className="h-4 w-4" /></Button>
                      <a href="tel:1930" className={buttonStyles('danger', 'lg')}>Call 1930</a>
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
      <PageIntro
        eyebrow="Register a complaint"
        title="One clear report. Four short steps."
        description="Choose what happened, answer only the questions relevant to that incident, organize evidence, review the auto-generated timeline, and leave with a trackable demo acknowledgement."
        aside="Use fictional information only. Files stay in your browser and are not uploaded."
      />

      <section className="page-shell pb-4">
        {completedCase ? (
          <div className="mx-auto max-w-5xl">
            <SuccessView record={completedCase} />
            <button type="button" onClick={startOver} className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-muted hover:text-paper"><ArrowLeft className="h-4 w-4" /> Start another demo report</button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="card overflow-hidden">
              {draft.emergencyCaptured ? (
                <div className="flex flex-col gap-2 border-b border-alert/20 bg-alert/[0.04] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="flex items-center gap-2 text-xs font-semibold text-alert"><Zap className="h-3.5 w-3.5" /> Golden Minutes details captured · response actions are simulated</p>
                  <a href="tel:1930" className="text-xs font-bold text-alert hover:underline">Call 1930</a>
                </div>
              ) : null}

              <div className="border-b border-black/[0.07] bg-mist px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4"><p className="text-sm text-muted">{savedLabel}</p><p className="text-sm text-muted">{Math.round(progress)}% complete</p></div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/[0.08]"><motion.div className="h-full rounded-full bg-brand" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} /></div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {steps.map((item) => {
                    const active = item.id === step
                    const done = item.id < step
                    return (
                      <button key={item.id} type="button" onClick={() => done && setStep(item.id)} disabled={!done} className={cx('rounded-xl border px-2 py-3 text-left transition sm:px-3', active && 'border-brand bg-brand/[0.06]', done && 'border-black/[0.10] bg-white hover:border-brand/40', !active && !done && 'border-transparent opacity-50')}>
                        <span className={cx('flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[0.62rem] font-bold', active ? 'bg-brand text-white' : done ? 'border border-brand/40 text-brand' : 'bg-black/[0.06] text-muted')}>{done ? <Check className="h-3.5 w-3.5" /> : item.id}</span>
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
                      <p className="eyebrow">Step 1 of 4</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">Tell us what happened — or choose a category.</h2>
                      <p className="mt-2 text-sm leading-6 text-muted">The copilot classifies the likely incident locally and selects the right reporting path. It is deterministic demo logic, not a production AI model.</p>

                      <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/[0.03] p-4 sm:p-5">
                        <div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="copilot" className="field-label mb-0">Cybercrime Copilot</label><span className="pill-badge"><Sparkles className="h-3.5 w-3.5" /> Local demo classifier</span></div>
                        <textarea id="copilot" value={draft.copilotText} onChange={(event) => update('copilotText', event.target.value.slice(0, 700))} className="text-area min-h-28" placeholder="Example: Someone called my father claiming to be CBI and made him transfer ₹2 lakh…" />
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Button type="button" size="sm" onClick={runCopilot}><Sparkles className="h-4 w-4" /> Classify incident</Button>
                          <Button type="button" variant="secondary" size="sm" onClick={startVoice} disabled={listening}>{listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{listening ? 'Listening…' : 'Voice complaint'}</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => update('copilotText', 'Someone called my father claiming to be CBI and said his Aadhaar was involved in money laundering. They made him transfer ₹2 lakh.')}>Use demo story</Button>
                        </div>
                        <FieldError>{errors.copilotText}</FieldError>

                        {copilotResult ? (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-black/[0.08] bg-white p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand">{copilotResult.severity} · {copilotResult.route}</p>
                                <p className="mt-1 text-base font-semibold text-paper">{copilotResult.label}</p>
                                <p className="mt-2 text-sm text-muted">{copilotResult.signals.join(' · ')}</p>
                              </div>
                              {copilotResult.incidentType === 'financial' ? <Button type="button" variant="danger" size="sm" onClick={() => setEmergencyLanding(true)}>Open emergency mode</Button> : null}
                            </div>
                          </motion.div>
                        ) : null}
                      </div>

                      <div className="mt-6 grid gap-2">
                        {incidentTypes.map((incident) => {
                          const active = draft.incidentType === incident.id
                          return (
                            <button key={incident.id} type="button" onClick={() => { update('incidentType', incident.id); if (incident.id !== 'women-child') update('anonymous', false) }} className={cx('flex w-full items-start justify-between gap-6 rounded-xl border p-4 text-left transition', active ? 'border-brand bg-brand/[0.05]' : 'border-black/[0.10] hover:border-brand/40')}>
                              <span><span className={cx('block text-[0.95rem]', active ? 'font-semibold text-brand' : 'text-paper')}>{incident.title}</span><span className="mt-1 block text-sm leading-6 text-muted">{incident.description}</span></span>
                              <span className={cx('mt-0.5 shrink-0 text-sm', active ? 'font-semibold text-brand' : 'text-muted')}>{active ? 'Selected' : 'Choose'}</span>
                            </button>
                          )
                        })}
                      </div>
                      <FieldError>{errors.incidentType}</FieldError>

                      {draft.incidentType === 'financial' ? (
                        <div className="mt-5 rounded-xl bg-alert p-4 text-white sm:flex sm:items-center sm:justify-between sm:gap-5">
                          <div><p className="text-sm font-semibold">Money already moved?</p><p className="mt-1 text-sm leading-6 text-white/75">Use Golden Minutes mode instead of waiting for the full form.</p></div>
                          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0"><Button type="button" variant="secondary" size="sm" onClick={() => setEmergencyLanding(true)}>I just lost money</Button><a href="tel:1930" className="inline-flex h-9 items-center rounded-lg bg-white/10 px-3.5 text-sm font-semibold text-white hover:bg-white/15">Call 1930</a></div>
                        </div>
                      ) : null}

                      {draft.incidentType === 'women-child' ? (
                        <div className="mt-5 rounded-2xl border border-brand/30 bg-brand/[0.04] p-4">
                          <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={draft.anonymous} onChange={(event) => update('anonymous', event.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" /><span><span className="block text-sm font-medium text-paper">Report anonymously</span><span className="mt-1 block text-xs leading-5 text-muted">Contact fields will be skipped. This remains a simulated submission.</span></span></label>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}

                  {step === 2 ? (
                    <motion.div key="step-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div><p className="eyebrow">Step 2 of 4 · contextual details</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">Only ask what matters for this incident.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Approximate details are okay. The fields below change with the category you selected.</p></div>
                        <Button type="button" variant="secondary" size="sm" onClick={fillDemoDetails} className="shrink-0"><FileCheck2 className="h-4 w-4" /> Use demo details</Button>
                      </div>

                      <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <div><label className="field-label" htmlFor="occurredAt">Approximate date and time</label><input id="occurredAt" type="datetime-local" value={draft.occurredAt} onChange={(event) => update('occurredAt', event.target.value)} className="text-field [color-scheme:light]" /><FieldError>{errors.occurredAt}</FieldError></div>
                        <div><label className="field-label" htmlFor="state">State / union territory</label><div className="relative"><select id="state" value={draft.state} onChange={(event) => update('state', event.target.value)} className="select-field"><option value="">Choose location</option>{indianStates.map((state) => <option key={state} value={state}>{state}</option>)}</select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div><FieldError>{errors.state}</FieldError></div>
                        <div className="sm:col-span-2"><label className="field-label" htmlFor="channel">Where did it happen?</label><div className="relative"><select id="channel" value={draft.channel} onChange={(event) => update('channel', event.target.value)} className="select-field"><option value="">Choose a channel</option>{channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}</select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div><FieldError>{errors.channel}</FieldError></div>

                        {draft.incidentType === 'financial' ? (
                          <>
                            <div><label className="field-label" htmlFor="amount">Amount lost</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">₹</span><input id="amount" value={draft.amount} onChange={(event) => update('amount', event.target.value)} className="text-field pl-8" placeholder="85,000" /></div><FieldError>{errors.amount}</FieldError></div>
                            <div><label className="field-label" htmlFor="paymentMethod">Payment method</label><div className="relative"><select id="paymentMethod" value={draft.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} className="select-field"><option value="">Choose method</option>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div><FieldError>{errors.paymentMethod}</FieldError></div>
                            <div><label className="field-label" htmlFor="transactionId">Transaction ID</label><input id="transactionId" value={draft.transactionId} onChange={(event) => update('transactionId', event.target.value)} className="text-field" placeholder="DEMO-UPI-42384021" /></div>
                            <div><label className="field-label" htmlFor="recipientIdentifier">Recipient UPI / account / phone</label><input id="recipientIdentifier" value={draft.recipientIdentifier} onChange={(event) => update('recipientIdentifier', event.target.value)} className="text-field" placeholder="merchant@upi" /><FieldError>{errors.recipientIdentifier}</FieldError></div>
                            <div><label className="field-label" htmlFor="platform">Platform used</label><input id="platform" value={draft.platform} onChange={(event) => update('platform', event.target.value)} className="text-field" placeholder="WhatsApp / Telegram / app" /></div>
                            <div><label className="field-label" htmlFor="remoteAccessAsked">Asked to install/share anything?</label><div className="relative"><select id="remoteAccessAsked" value={draft.remoteAccessAsked} onChange={(event) => update('remoteAccessAsked', event.target.value)} className="select-field"><option value="">Choose</option><option value="yes">Yes — app / screen / OTP / access</option><option value="no">No</option><option value="unsure">Not sure</option></select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div></div>
                          </>
                        ) : null}

                        {draft.incidentType === 'account' ? (
                          <>
                            <div><label className="field-label" htmlFor="accountPlatform">Which platform?</label><input id="accountPlatform" value={draft.accountPlatform} onChange={(event) => update('accountPlatform', event.target.value)} className="text-field" placeholder="Instagram / Gmail / Facebook" /><FieldError>{errors.accountPlatform}</FieldError></div>
                            <div><label className="field-label" htmlFor="stillHasAccess">Do you still have access?</label><div className="relative"><select id="stillHasAccess" value={draft.stillHasAccess} onChange={(event) => update('stillHasAccess', event.target.value)} className="select-field"><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option><option value="partial">Partially</option></select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div></div>
                            <div><label className="field-label" htmlFor="contactChanged">Was email/phone changed?</label><div className="relative"><select id="contactChanged" value={draft.contactChanged} onChange={(event) => update('contactChanged', event.target.value)} className="select-field"><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option></select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div></div>
                            <div><label className="field-label" htmlFor="accountPlatform2">Attacker/profile identifier <span className="font-normal text-muted">(optional)</span></label><input id="accountPlatform2" value={draft.suspiciousIdentifier} onChange={(event) => update('suspiciousIdentifier', event.target.value)} className="text-field" placeholder="Profile URL / email / phone" /></div>
                          </>
                        ) : null}

                        {(draft.incidentType === 'harassment' || draft.incidentType === 'women-child') ? (
                          <>
                            <div><label className="field-label" htmlFor="harassmentHandle">Account / handle / phone</label><input id="harassmentHandle" value={draft.harassmentHandle} onChange={(event) => update('harassmentHandle', event.target.value)} className="text-field" placeholder="@username or number" /></div>
                            <div><label className="field-label" htmlFor="threatType">What is happening?</label><div className="relative"><select id="threatType" value={draft.threatType} onChange={(event) => update('threatType', event.target.value)} className="select-field"><option value="">Choose closest match</option><option>Threats / abuse</option><option>Stalking / repeated contact</option><option>Blackmail / sextortion</option><option>Non-consensual sharing</option><option>Grooming / child safety</option><option>Other</option></select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div></div>
                          </>
                        ) : null}

                        {draft.incidentType === 'suspicious-content' ? (
                          <div className="sm:col-span-2"><label className="field-label" htmlFor="suspiciousIdentifier">Suspicious phone / UPI / email / URL</label><input id="suspiciousIdentifier" value={draft.suspiciousIdentifier} onChange={(event) => update('suspiciousIdentifier', event.target.value)} className="text-field" placeholder="Paste the identifier exactly as shown" /><FieldError>{errors.suspiciousIdentifier}</FieldError></div>
                        ) : null}

                        {draft.incidentType === 'other' ? (
                          <>
                            <div><label className="field-label" htmlFor="malwareApp">Suspicious app / file <span className="font-normal text-muted">(optional)</span></label><input id="malwareApp" value={draft.malwareApp} onChange={(event) => update('malwareApp', event.target.value)} className="text-field" placeholder="APK / application / filename" /></div>
                            <div><label className="field-label" htmlFor="remoteOther">Remote access involved?</label><div className="relative"><select id="remoteOther" value={draft.remoteAccessAsked} onChange={(event) => update('remoteAccessAsked', event.target.value)} className="select-field"><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option></select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" /></div></div>
                          </>
                        ) : null}

                        <div className="sm:col-span-2"><div className="mb-2 flex items-end justify-between gap-4"><label className="field-label mb-0" htmlFor="description">What happened?</label><span className="font-mono text-[0.6rem] text-muted">{draft.description.length}/1000</span></div><textarea id="description" value={draft.description} onChange={(event) => update('description', event.target.value.slice(0, 1000))} className="text-area min-h-40" placeholder="Tell the sequence: who contacted you, what they asked, what changed, and what happened next." /><p className="field-help">Do not paste real passwords, PINs, OTPs, Aadhaar, PAN or bank credentials.</p><FieldError>{errors.description}</FieldError></div>
                      </div>
                    </motion.div>
                  ) : null}

                  {step === 3 ? (
                    <motion.div key="step-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">Step 3 of 4 · smart evidence assistant</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">Preserve proof. Let the prototype organize it.</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Add screenshots, transaction receipts, chat exports or PDFs. File contents never leave the browser; classification below is based on filenames and demo fields only.</p>

                      <div className="mt-6 rounded-2xl border border-dashed border-black/[0.18] bg-mist p-7 text-center transition hover:border-brand hover:bg-brand/[0.03] sm:p-10" onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}>
                        <h3 className="text-lg font-semibold text-paper">Drop evidence here</h3><p className="mt-2 text-sm text-muted">PNG, JPG, PDF or text · up to 5 MB each · maximum 8 items</p>
                        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row"><Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><Plus className="h-4 w-4" /> Choose files</Button><Button type="button" variant="ghost" size="sm" onClick={addDemoEvidence}>Add prepared demo evidence</Button></div>
                        <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp,application/pdf,text/plain" className="sr-only" onChange={(event) => event.target.files && addFiles(event.target.files)} />
                      </div>
                      {fileError ? <FieldError>{fileError}</FieldError> : null}

                      {draft.evidenceItems.length ? (
                        <div className="mt-5 grid gap-2">
                          {draft.evidenceItems.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-black/[0.08] px-4 py-3">
                              <div className="min-w-0"><p className="truncate text-sm font-semibold text-paper">{item.name}</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className="rounded-md bg-brand/[0.07] px-2 py-0.5 text-[0.66rem] font-semibold text-brand">{item.kind}</span><span className="font-mono text-[0.57rem] uppercase tracking-[0.1em] text-muted">{item.confidence}% demo confidence · local only</span></div></div>
                              <button type="button" onClick={() => removeEvidence(index)} className="rounded-lg p-2 text-muted hover:bg-alert/[0.08] hover:text-alert" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
                        <div className="rounded-2xl border border-brand/20 bg-brand/[0.035] p-5">
                          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-brand">Evidence intelligence</p><h3 className="mt-2 text-base font-semibold text-paper">Extracted automatically · simulated</h3></div><span className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-bold text-brand">{completeness.score}% complete</span></div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {Object.entries(extracted).filter(([, value]) => Boolean(value)).map(([label, value]) => <div key={label} className="rounded-lg border border-black/[0.07] bg-white p-3"><p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</p><p className="mt-1 break-all text-sm font-semibold text-paper">{value}</p></div>)}
                            {!Object.values(extracted).some(Boolean) ? <p className="text-sm leading-6 text-muted sm:col-span-2">Add contextual details or prepared evidence to populate extracted fields.</p> : null}
                          </div>
                        </div>
                        <div className="surface-soft p-5">
                          <p className="eyebrow">Evidence completeness</p>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.08]"><motion.div className="h-full rounded-full bg-brand" animate={{ width: `${completeness.score}%` }} /></div>
                          {completeness.missing.length ? <><p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Still useful to add</p><ul className="mt-2 space-y-2">{completeness.missing.map((item) => <li key={item} className="flex gap-2 text-sm text-muted"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-alert" />{item}</li>)}</ul></> : <p className="mt-4 text-sm font-semibold text-brand">Core demo evidence fields are covered.</p>}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {step === 4 ? (
                    <motion.div key="step-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p className="eyebrow">Step 4 of 4 · review</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">Review the structured complaint and timeline.</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">The same complaint object powers acknowledgement, tracking, evidence intelligence and recovery views.</p>

                      {!draft.anonymous ? (
                        <div className="mt-6 rounded-2xl border border-black/[0.08] p-5 sm:p-6">
                          <div className="mb-5"><h3 className="text-base font-semibold text-paper">Fictional demo contact</h3><p className="mt-0.5 text-xs text-muted">Used only to complete the prototype journey.</p></div>
                          <div className="grid gap-5 sm:grid-cols-2"><div><label className="field-label" htmlFor="fullName">Full name</label><input id="fullName" value={draft.fullName} onChange={(event) => update('fullName', event.target.value)} className="text-field" placeholder="Priya Demo" /><FieldError>{errors.fullName}</FieldError></div><div><label className="field-label" htmlFor="mobile">Mobile number</label><input id="mobile" inputMode="numeric" value={draft.mobile} onChange={(event) => update('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))} className="text-field" placeholder="9000001930" /><FieldError>{errors.mobile}</FieldError></div><div className="sm:col-span-2"><label className="field-label" htmlFor="email">Email <span className="font-normal text-muted">(optional)</span></label><input id="email" type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} className="text-field" placeholder="priya@example.com" /><FieldError>{errors.email}</FieldError></div></div>
                        </div>
                      ) : <div className="mt-6 rounded-xl border border-black/[0.08] p-5"><p className="text-sm font-medium text-paper">Anonymous reporting selected</p><p className="mt-1 text-sm leading-6 text-muted">No name, mobile number or email will be included in this demo record.</p></div>}

                      <div className="mt-5 surface-soft p-5 sm:p-6">
                        <div className="mb-3 flex items-center justify-between gap-4"><h3 className="text-base font-semibold text-paper">Report summary</h3><button type="button" onClick={() => setStep(1)} className="link-accent text-xs">Edit</button></div>
                        <SummaryRow label="Incident" value={selectedIncident?.title ?? ''} />
                        <SummaryRow label="Occurred" value={formatDateTime(draft.occurredAt)} />
                        <SummaryRow label="Location" value={draft.state} />
                        <SummaryRow label="Channel" value={draft.channel} />
                        {draft.incidentType === 'financial' ? <><SummaryRow label="Amount" value={draft.amount ? `₹${draft.amount}` : ''} /><SummaryRow label="Payment" value={draft.paymentMethod} /><SummaryRow label="Transaction" value={draft.transactionId} /><SummaryRow label="Recipient" value={draft.recipientIdentifier} /></> : null}
                        {draft.incidentType === 'account' ? <><SummaryRow label="Platform" value={draft.accountPlatform} /><SummaryRow label="Still has access" value={draft.stillHasAccess} /><SummaryRow label="Email/phone changed" value={draft.contactChanged} /></> : null}
                        {(draft.incidentType === 'harassment' || draft.incidentType === 'women-child') ? <SummaryRow label="Suspect account" value={draft.harassmentHandle} /> : null}
                        {draft.incidentType === 'suspicious-content' ? <SummaryRow label="Identifier" value={draft.suspiciousIdentifier} /> : null}
                        <SummaryRow label="Evidence" value={`${draft.evidenceNames.length} files · ${completeness.score}% completeness`} />
                        <SummaryRow label="Description" value={draft.description} />
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="surface p-5"><div className="flex items-center gap-2"><FileSearch className="h-4 w-4 text-brand" /><p className="eyebrow text-brand">Automatic incident timeline</p></div><div className="mt-4 space-y-3">{incidentTimeline.map((item, index) => <div key={`${item.time}-${index}`} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-black/[0.06] pb-3 last:border-0 last:pb-0"><span className="font-mono text-[0.64rem] font-semibold text-muted">{item.time}</span><p className="text-sm leading-5 text-paper">{item.event}</p></div>)}</div></div>
                        <div className="rounded-2xl border border-brand/20 bg-brand/[0.035] p-5"><p className="eyebrow text-brand">Dynamic next-action plan</p><ol className="mt-4 space-y-3">{actionPlan.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted"><span className="font-mono text-xs font-bold text-brand">0{index + 1}</span>{item}</li>)}</ol></div>
                      </div>

                      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-black/[0.08] p-4"><input type="checkbox" checked={draft.consent} onChange={(event) => update('consent', event.target.checked)} className="mt-1 h-4 w-4 accent-brand" /><span><span className="block text-sm font-semibold text-paper">I understand this is an independent prototype using synthetic data.</span><span className="mt-1 block text-xs leading-5 text-muted">Submitting creates a local demo record only. It is not a complaint to the Government of India, a police authority, 1930 or a bank.</span></span></label>
                      <FieldError>{errors.consent}</FieldError>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" size="lg" onClick={previousStep} disabled={step === 1}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  {step < 4 ? <Button size="lg" onClick={nextStep}>Continue <ArrowRight className="h-4 w-4" /></Button> : <Button size="lg" onClick={submitReport} loading={submitting}><ShieldCheck className="h-4 w-4" /> Submit demo complaint</Button>}
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="surface-soft p-5"><p className="eyebrow">Current selection</p>{selectedIncident ? <div className="mt-4"><p className="text-sm font-medium text-paper">{selectedIncident.title}</p><p className="mt-3 text-sm leading-6 text-muted">{selectedIncident.hint}</p></div> : <p className="mt-3 text-sm leading-6 text-muted">Choose an incident type to see contextual guidance.</p>}</div>

              {draft.evidenceNames.length ? <div className="surface-soft p-5"><p className="eyebrow">Evidence status</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-bold tracking-[-0.04em] text-paper">{completeness.score}%</p><p className="text-xs text-muted">{draft.evidenceNames.length} files</p></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.08]"><div className="h-full rounded-full bg-brand" style={{ width: `${completeness.score}%` }} /></div></div> : null}

              <div className="surface-soft p-5"><p className="text-sm font-medium text-paper">Secure prototype boundary</p><ul className="mt-4 space-y-3 text-sm leading-6 text-muted"><li>No real government, bank or police API calls.</li><li>File contents never leave this device.</li><li>Drafts and cases use browser storage only.</li><li>Threat intelligence and AI outputs are simulated.</li></ul></div>

              <div className="rounded-2xl bg-alert p-5 text-white"><p className="text-sm font-semibold">Financial loss</p><p className="mt-2 text-xs leading-5 text-white/75">Do not wait for the form. Call 1930, then contact the bank or payment provider.</p><div className="mt-4 grid gap-2"><button type="button" onClick={() => { update('incidentType', 'financial'); setEmergencyLanding(true) }} className="flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90"><BadgeIndianRupee className="mr-2 h-4 w-4" /> I just lost money</button><a href="tel:1930" className="flex h-9 w-full items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white hover:bg-white/15">Call 1930</a></div></div>
            </aside>
          </div>
        )}
      </section>
    </>
  )
}
