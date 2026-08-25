import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  AtSign,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  FileWarning,
  Globe2,
  Info,
  Link2,
  Mail,
  Phone,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  WalletCards,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { demoSuspectResults, identifierConfig } from '../data/content'
import { cx } from '../lib/cx'
import type { IdentifierType, SuspectResult } from '../types'

const identifierTypes: Array<{ id: IdentifierType; label: string; icon: typeof Phone }> = [
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'upi', label: 'UPI ID', icon: WalletCards },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'url', label: 'Website', icon: Globe2 },
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
    label: 'High risk',
    icon: TriangleAlert,
    panel: 'border-coral/25 bg-coral/[0.07]',
    badge: 'bg-coral text-ink',
    text: 'text-coral',
  },
  medium: {
    label: 'Use caution',
    icon: AlertTriangle,
    panel: 'border-saffron/25 bg-saffron/[0.065]',
    badge: 'bg-saffron text-ink',
    text: 'text-saffron',
  },
  clear: {
    label: 'No demo match',
    icon: ShieldCheck,
    panel: 'border-aqua/20 bg-aqua/[0.055]',
    badge: 'bg-aqua text-ink',
    text: 'text-aqua',
  },
}

export function CheckPage() {
  const [type, setType] = useState<IdentifierType>('phone')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SuspectResult | null>(null)
  const [checkedValue, setCheckedValue] = useState('')
  const config = identifierConfig[type]

  const InputIcon = useMemo(() => identifierTypes.find((item) => item.id === type)?.icon ?? Search, [type])

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

  const ResultIcon = result ? riskStyles[result.risk].icon : ShieldCheck

  return (
    <>
      <PageIntro
        index="02"
        eyebrow="Check suspect repository"
        title={<>Pause before<br /><span className="text-aqua">you trust.</span></>}
        description="Search a phone number, UPI ID, email address or website in a synthetic repository, then get a clear risk explanation and next action."
        aside={
          <div className="rounded-2xl border border-saffron/[0.18] bg-saffron/[0.055] p-4">
            <div className="flex items-start gap-3">
              <Radar className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
              <div>
                <p className="text-sm font-bold text-paper">Small demo repository</p>
                <p className="mt-1 text-xs leading-5 text-muted">Results are fictional and designed only to demonstrate the citizen journey.</p>
              </div>
            </div>
          </div>
        }
      />

      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-8">
          <div>
            <div className="surface overflow-hidden rounded-[1.8rem]">
              <div className="border-b border-white/[0.08] p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Synthetic identifier scan</p>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-3xl">What do you want to check?</h2>
                  </div>
                  <span className="hidden h-11 w-11 items-center justify-center rounded-xl border border-aqua/[0.18] bg-aqua/[0.055] text-aqua sm:flex">
                    <Search className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {identifierTypes.map((item) => {
                    const Icon = item.icon
                    const active = type === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => chooseType(item.id)}
                        className={cx(
                          'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition',
                          active
                            ? 'border-aqua/30 bg-aqua/[0.08] text-paper'
                            : 'border-white/[0.07] bg-white/[0.025] text-muted hover:border-white/[0.15] hover:text-paper',
                        )}
                      >
                        <Icon className={cx('h-4 w-4', active && 'text-aqua')} /> {item.label}
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
                    <InputIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      id="identifier"
                      value={value}
                      inputMode={type === 'phone' ? 'numeric' : 'text'}
                      onChange={(event) => {
                        setValue(event.target.value)
                        setError('')
                      }}
                      className="text-field h-14 pl-11 pr-28 text-base"
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
                        className="absolute right-[6.7rem] top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-paper"
                        aria-label="Clear input"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                    <Button type="submit" size="md" loading={loading} className="absolute right-1.5 top-1.5 h-11">
                      Check <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-muted">{config.helper}</p>
                    <button type="button" onClick={useExample} className="inline-flex items-center gap-1.5 text-left text-xs font-bold text-aqua hover:text-paper">
                      Try flagged demo <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {error ? (
                    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-coral"><CircleAlert className="h-4 w-4" /> {error}</p>
                  ) : null}
                </form>
              </div>

              <div className="min-h-[25rem] p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[20rem] flex-col items-center justify-center text-center">
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-aqua/20">
                        <div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-aqua" />
                        <Radar className="h-7 w-7 text-aqua" />
                      </div>
                      <p className="mt-5 text-base font-extrabold text-paper">Checking synthetic signals…</p>
                      <p className="mt-2 max-w-sm text-xs leading-5 text-muted">Comparing the exact identifier against the local demo repository.</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div key={`${result.risk}-${checkedValue}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <div className={cx('rounded-2xl border p-5 sm:p-6', riskStyles[result.risk].panel)}>
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-4">
                            <span className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', riskStyles[result.risk].badge)}>
                              <ResultIcon className="h-6 w-6" />
                            </span>
                            <div>
                              <span className={cx('font-mono text-[0.62rem] font-bold uppercase tracking-[0.15em]', riskStyles[result.risk].text)}>{riskStyles[result.risk].label}</span>
                              <h3 className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-paper sm:text-2xl">{result.title}</h3>
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{result.summary}</p>
                            </div>
                          </div>
                          <div className="shrink-0 rounded-xl border border-white/[0.08] bg-ink/[0.45] px-4 py-3">
                            <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted">Checked value</p>
                            <p className="mt-1 max-w-[12rem] break-all text-xs font-bold text-paper">{checkedValue}</p>
                          </div>
                        </div>

                        {result.reports !== null ? (
                          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08]">
                            <div className="bg-ink/[0.55] p-4">
                              <p className="font-mono text-2xl font-bold text-paper">{result.reports}</p>
                              <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">Demo reports</p>
                            </div>
                            <div className="bg-ink/[0.55] p-4">
                              <p className="font-mono text-sm font-bold text-paper">{result.firstSeen ?? '—'}</p>
                              <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">First demo signal</p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                          <p className="eyebrow">Why this result</p>
                          <ul className="mt-4 space-y-3">
                            {result.signals.map((signal) => (
                              <li key={signal} className="flex gap-2.5 text-sm leading-6 text-paper/[0.80]">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" /> {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                          <p className="eyebrow">What to do next</p>
                          <ul className="mt-4 space-y-3">
                            {result.nextSteps.map((step) => (
                              <li key={step} className="flex gap-2.5 text-sm leading-6 text-paper/[0.80]">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-signal" /> {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link to="/report?type=suspicious-content" className={buttonStyles(result.risk === 'high' ? 'danger' : 'primary', 'lg')}>
                          Report this identifier <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Button variant="secondary" size="lg" onClick={() => {
                          navigator.clipboard?.writeText(checkedValue).catch(() => undefined)
                        }}>
                          <Copy className="h-4 w-4" /> Copy identifier
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex min-h-[20rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] p-8 text-center">
                      <div className="absolute inset-0 bg-radial-grid bg-[length:20px_20px] opacity-[0.15] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
                      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-aqua/[0.18] bg-aqua/[0.055] text-aqua">
                        <ShieldAlert className="h-7 w-7" />
                      </span>
                      <h3 className="relative mt-5 text-xl font-extrabold tracking-[-0.03em] text-paper">Check before you pay, click or reply.</h3>
                      <p className="relative mt-2 max-w-md text-sm leading-6 text-muted">Choose an identifier above or use the flagged demo value to see the complete result experience.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="surface-soft rounded-2xl p-5">
              <p className="eyebrow">Before you trust it</p>
              <div className="mt-4 space-y-4">
                {[
                  ['Verify separately', 'Call a known number or open the service directly.'],
                  ['Ignore urgency', 'Pressure to act now is a common warning signal.'],
                  ['Protect control', 'Never share OTPs, PINs or remote screen access.'],
                ].map(([title, detail], index) => (
                  <div key={title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-signal/[0.08] font-mono text-[0.6rem] font-bold text-signal">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-paper">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-coral/[0.18] bg-coral/[0.055] p-5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-paper">
                <FileWarning className="h-4 w-4 text-coral" /> Already lost money?
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">Do not stop at a suspect check. Call 1930 and file a financial-fraud complaint.</p>
              <a href="tel:1930" className={cx(buttonStyles('danger', 'sm'), 'mt-4 w-full')}>Call 1930</a>
            </div>

            <div className="surface-soft rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                <p className="text-xs leading-5 text-muted">A repository can contain errors and never covers every scam. A clean result cannot certify that an identifier is safe.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
