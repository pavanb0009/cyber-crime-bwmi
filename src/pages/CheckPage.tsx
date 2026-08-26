import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  FileImage,
  Link2,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { demoSuspectResults, identifierConfig } from '../data/content'
import { cx } from '../lib/cx'
import type { IdentifierType, SuspectResult } from '../types'

const identifierTypes: Array<{ id: IdentifierType; label: string }> = [
  { id: 'phone', label: 'Phone' },
  { id: 'upi', label: 'UPI ID' },
  { id: 'email', label: 'Email' },
  { id: 'url', label: 'Website' },
]

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
    score: 18,
    title: 'No matching report in the demo repository',
    summary: `This synthetic ${identifierConfig[type].label.toLowerCase()} is not present in the small demo dataset. That is not proof that it is safe.`,
    reports: 0,
    firstSeen: null,
    lastSeen: null,
    pattern: 'No exact synthetic match',
    related: [],
    signals: ['No exact demo match', 'Repository coverage is intentionally limited', 'Scammers change identifiers quickly'],
    nextSteps: ['Verify through another trusted channel', 'Do not share OTPs, PINs or screen access', 'Report anything suspicious or harmful'],
  }
}

const riskStyles = {
  high: {
    label: 'High risk',
    panel: 'border-alert/40 bg-alert/[0.055]',
    badge: 'bg-alert text-white',
    meter: 'bg-alert',
  },
  medium: {
    label: 'Use caution',
    panel: 'border-[#d97706]/30 bg-[#d97706]/[0.045]',
    badge: 'bg-[#d97706] text-white',
    meter: 'bg-[#d97706]',
  },
  clear: {
    label: 'No demo match',
    panel: 'border-brand/25 bg-brand/[0.035]',
    badge: 'bg-brand text-white',
    meter: 'bg-brand',
  },
}

function RiskResult({ result, checkedValue }: { result: SuspectResult; checkedValue: string }) {
  const style = riskStyles[result.risk]
  const suspectParam = encodeURIComponent(checkedValue)
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className={cx('rounded-2xl border p-5 sm:p-6', style.panel)}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className={cx('inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em]', style.badge)}>
              {style.label}
            </span>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">{result.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{result.summary}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-center shadow-sm">
            <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Risk score</p>
            <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-paper">{result.score ?? 50}<span className="text-sm font-medium text-muted">/100</span></p>
          </div>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
          <motion.div initial={{ width: 0 }} animate={{ width: `${result.score ?? 50}%` }} className={cx('h-full rounded-full', style.meter)} />
        </div>
        <div className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-2 lg:grid-cols-4">
          <p><span className="font-semibold text-paper">Checked:</span> {checkedValue}</p>
          <p><span className="font-semibold text-paper">Reports:</span> {result.reports ?? '—'} simulated</p>
          <p><span className="font-semibold text-paper">First:</span> {result.firstSeen ?? '—'}</p>
          <p><span className="font-semibold text-paper">Last:</span> {result.lastSeen ?? '—'}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="surface-soft p-5">
          <p className="eyebrow">Threat intelligence</p>
          <p className="mt-2 text-sm font-semibold text-paper">{result.pattern ?? 'Pattern not established'}</p>
          <ul className="mt-4 space-y-2">
            {result.signals.map((signal) => (
              <li key={signal} className="flex gap-2 text-sm leading-6 text-muted">
                <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-alert" /> {signal}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface p-5">
          <p className="eyebrow">Related identifiers</p>
          {result.related?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.related.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-mist px-2.5 py-1.5 font-mono text-[0.68rem] text-paper">
                  <Link2 className="h-3 w-3 text-brand" /> {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">No linked synthetic identifiers in this demo result.</p>
          )}
          <p className="eyebrow mt-5">Recommended now</p>
          <ol className="mt-3 space-y-2">
            {result.nextSteps.map((step, index) => (
              <li key={step} className="flex gap-2 text-sm leading-6 text-muted"><span className="font-mono text-xs font-bold text-brand">0{index + 1}</span>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link to={`/report?type=suspicious-content&suspect=${suspectParam}`} className={buttonStyles('secondary', 'lg')}>
          Report this identifier
        </Link>
        <Link to={`/report?type=financial&mode=emergency&suspect=${suspectParam}`} className={buttonStyles('danger', 'lg')}>
          I already paid <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}

export function CheckPage() {
  const [mode, setMode] = useState<'identifier' | 'screenshot'>('identifier')
  const [type, setType] = useState<IdentifierType>('phone')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SuspectResult | null>(null)
  const [checkedValue, setCheckedValue] = useState('')
  const [scanFile, setScanFile] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
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
    await new Promise((resolve) => window.setTimeout(resolve, 650))
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

  async function scanScreenshot(fileName: string) {
    setScanFile(fileName)
    setScanDone(false)
    setScanLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    setScanLoading(false)
    setScanDone(true)
  }

  return (
    <>
      <PageIntro
        eyebrow="Check before you trust"
        title="One place to scan the signal."
        description="Check a phone, UPI ID, email or website — or run a local demo analysis on a suspicious chat screenshot. Results are synthetic and deterministic for this prototype."
        aside="No file contents are uploaded. Screenshot analysis is simulated locally for the hackathon demo."
      />

      <section className="page-shell pb-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex rounded-xl border border-black/[0.08] bg-mist p-1">
            <button type="button" onClick={() => setMode('identifier')} className={cx('flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition', mode === 'identifier' ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-paper')}>
              <ScanSearch className="mr-2 inline h-4 w-4" /> Identifier scanner
            </button>
            <button type="button" onClick={() => setMode('screenshot')} className={cx('flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition', mode === 'screenshot' ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-paper')}>
              <FileImage className="mr-2 inline h-4 w-4" /> Screenshot scanner
            </button>
          </div>

          {mode === 'identifier' ? (
            <div className="card overflow-hidden">
              <div className="border-b border-black/[0.07] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Synthetic intelligence repository</p>
                    <h2 className="section-title mt-2">What do you want to check?</h2>
                  </div>
                  <span className="pill-badge"><Sparkles className="h-3.5 w-3.5" /> Demo threat intelligence</span>
                </div>

                <div className="mt-6 flex gap-5 overflow-x-auto border-b border-black/[0.08]">
                  {identifierTypes.map((item) => {
                    const active = type === item.id
                    return (
                      <button key={item.id} type="button" onClick={() => chooseType(item.id)} className={cx('-mb-px shrink-0 border-b-2 py-2 text-sm transition', active ? 'border-brand font-semibold text-brand' : 'border-transparent text-muted hover:text-paper')}>
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void runCheck() }}>
                  <label htmlFor="identifier" className="field-label">{config.label}</label>
                  <div className="relative">
                    <input id="identifier" value={value} inputMode={type === 'phone' ? 'numeric' : 'text'} onChange={(event) => { setValue(event.target.value); setError('') }} className="text-field h-12 pr-24 text-base" placeholder={config.placeholder} autoComplete="off" />
                    <Button type="submit" size="md" loading={loading} className="absolute right-1 top-1 h-10">Check</Button>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">{config.helper}</p>
                    <button type="button" onClick={() => { setValue(config.example); setError(''); void runCheck(config.example) }} className="link-accent text-left text-sm">Try flagged demo</button>
                  </div>
                  {error ? <p className="mt-3 text-sm font-semibold text-alert">{error}</p> : null}
                </form>
              </div>

              <div className="min-h-[26rem] p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[18rem] flex-col items-start justify-center">
                      <div className="scan-line w-full max-w-md" />
                      <p className="mt-5 text-base font-medium text-paper">Correlating synthetic reports…</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Checking repeat complaints, identifier relationships and known demo patterns.</p>
                    </motion.div>
                  ) : result ? (
                    <RiskResult key={`${result.risk}-${checkedValue}`} result={result} checkedValue={checkedValue} />
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[18rem] flex-col justify-center">
                      <ShieldAlert className="h-8 w-8 text-brand" />
                      <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-paper">Check before you click, trust or pay.</h3>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-muted">The demo result explains why an identifier is risky, linked synthetic identifiers, and what to do next — not just a red/green label.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="border-b border-black/[0.07] p-5 sm:p-6">
                <p className="eyebrow">Screenshot scam scanner</p>
                <h2 className="section-title mt-2">Drop a suspicious chat screenshot.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">For the hackathon, any selected image follows a deterministic synthetic analysis path so the demo is reliable. Nothing leaves this browser.</p>
              </div>
              <div className="p-5 sm:p-6">
                {!scanDone && !scanLoading ? (
                  <div className="rounded-2xl border border-dashed border-black/[0.18] bg-mist p-8 text-center sm:p-12">
                    <Upload className="mx-auto h-7 w-7 text-brand" />
                    <h3 className="mt-4 text-lg font-semibold text-paper">Choose a WhatsApp or Telegram screenshot</h3>
                    <p className="mt-2 text-sm text-muted">PNG / JPG · local demo analysis only</p>
                    <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                      <Button variant="secondary" onClick={() => fileRef.current?.click()}>Choose screenshot</Button>
                      <Button variant="ghost" onClick={() => void scanScreenshot('whatsapp-investment-demo.png')}>Use prepared demo</Button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void scanScreenshot(file.name) }} />
                  </div>
                ) : scanLoading ? (
                  <div className="flex min-h-[20rem] flex-col justify-center">
                    <div className="scan-line w-full max-w-lg" />
                    <p className="mt-5 text-base font-semibold text-paper">Reading visible scam signals…</p>
                    <p className="mt-2 text-sm text-muted">Simulating OCR, identifier extraction and scam classification.</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-2xl border border-alert/30 bg-alert/[0.045] p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span className="inline-flex rounded-full bg-alert px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white">High risk · 92/100</span>
                          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-paper">Suspicious message detected</h3>
                          <p className="mt-2 text-sm leading-6 text-muted">Likely scam: <span className="font-semibold text-paper">KYC / bank impersonation</span></p>
                        </div>
                        <div className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-[0.68rem] text-muted">{scanFile}</div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.9fr]">
                      <div className="surface-soft p-5">
                        <p className="eyebrow">Extracted automatically · simulated</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {[
                            ['Phone', '+91 9876543210'],
                            ['UPI', 'refunddesk@upi'],
                            ['URL', 'secure-kyc-update.example'],
                            ['Platform', 'WhatsApp'],
                          ].map(([label, data]) => (
                            <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-3">
                              <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
                              <p className="mt-1 break-all text-sm font-semibold text-paper">{data}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="surface p-5">
                        <p className="eyebrow">Detected phrases</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['“Account will be blocked”', '“Complete KYC immediately”', 'Urgent payment request'].map((phrase) => <span key={phrase} className="rounded-lg bg-alert/[0.06] px-2.5 py-1.5 text-xs font-medium text-alert">{phrase}</span>)}
                        </div>
                        <div className="mt-5 flex gap-2 text-sm leading-6 text-muted">
                          <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-alert" />
                          <p>Do not click, do not share OTP/PIN, and verify directly through the bank’s official channel.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Link to="/report?type=suspicious-content&suspect=secure-kyc-update.example" className={buttonStyles('secondary', 'lg')}>Report this evidence</Link>
                      <Link to="/report?type=financial&mode=emergency&suspect=refunddesk%40upi" className={buttonStyles('danger', 'lg')}>I already paid <ArrowRight className="h-4 w-4" /></Link>
                      <Button variant="ghost" size="lg" onClick={() => { setScanDone(false); setScanFile('') }}>Scan another</Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
