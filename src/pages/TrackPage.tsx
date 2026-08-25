import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  FileClock,
  FileSearch,
  Info,
  MapPin,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { incidentTypes } from '../data/content'
import { cx } from '../lib/cx'
import { defaultDemoCase, findCase, loadCases } from '../lib/storage'
import type { CaseRecord } from '../types'

function getCase(reference: string): CaseRecord | undefined {
  const clean = reference.trim().toUpperCase()
  if (clean === defaultDemoCase.caseId) return defaultDemoCase
  return findCase(clean)
}

function downloadStatus(record: CaseRecord) {
  const lines = [
    'RAKSHAK / 1930 — DEMO CASE STATUS',
    'Independent prototype. This is not an official complaint record.',
    '',
    `Reference: ${record.caseId}`,
    `Created: ${record.createdAt}`,
    `Status: ${record.statusLabel}`,
    `Progress: ${record.progress}%`,
    `Assigned unit: ${record.assignedUnit}`,
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
      setError('Enter a demo acknowledgement number.')
      setRecord(null)
      return
    }
    setLoading(true)
    setError('')
    await new Promise((resolve) => window.setTimeout(resolve, 540))
    const found = getCase(clean)
    if (!found) {
      setRecord(null)
      setError('No local demo case matches that reference. Try NCRP-DEMO-26-84019.')
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
    ? incidentTypes.find((item) => item.id === record.incidentType)?.title ?? record.incidentType
    : ''

  return (
    <>
      <PageIntro
        index="03"
        eyebrow="Track complaint"
        title={<>Status without<br /><span className="text-saffron">the mystery.</span></>}
        description="Replace opaque status codes with a readable timeline: what is done, what is happening now, which unit owns it, and what comes next."
        aside={
          <button
            type="button"
            onClick={() => {
              setReference(defaultDemoCase.caseId)
              void runSearch(defaultDemoCase.caseId)
            }}
            className="w-full rounded-2xl border border-saffron/20 bg-saffron/[0.06] p-4 text-left transition hover:border-saffron/[0.35] hover:bg-saffron/[0.08]"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
              <div>
                <p className="text-sm font-bold text-paper">Use the reviewer demo case</p>
                <p className="mt-1 font-mono text-[0.65rem] font-semibold text-saffron">{defaultDemoCase.caseId}</p>
              </div>
            </div>
          </button>
        }
      />

      <section className="page-shell">
        <div className="surface mx-auto max-w-5xl overflow-hidden rounded-[1.8rem]">
          <div className="border-b border-white/[0.08] p-5 sm:p-7">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void runSearch()
              }}
            >
              <label htmlFor="caseReference" className="field-label">Demo acknowledgement number</label>
              <div className="relative">
                <FileSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="caseReference"
                  value={reference}
                  onChange={(event) => {
                    setReference(event.target.value.toUpperCase())
                    setError('')
                  }}
                  className="text-field h-14 pl-11 pr-28 font-mono text-sm uppercase tracking-[0.04em]"
                  placeholder="NCRP-DEMO-26-84019"
                  autoComplete="off"
                />
                <Button type="submit" size="md" loading={loading} className="absolute right-1.5 top-1.5 h-11">
                  Track <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted">Only cases created inside this browser and the reviewer demo case are available.</p>
                <button
                  type="button"
                  onClick={() => {
                    setReference(defaultDemoCase.caseId)
                    void runSearch(defaultDemoCase.caseId)
                  }}
                  className="inline-flex items-center gap-1.5 text-left text-xs font-bold text-saffron hover:text-paper"
                >
                  Fill demo reference <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              {error ? (
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-coral"><CircleAlert className="h-4 w-4" /> {error}</p>
              ) : null}
            </form>
          </div>

          <div className="min-h-[26rem] p-5 sm:p-7 lg:p-9">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[22rem] flex-col items-center justify-center text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-saffron/20">
                    <div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-saffron" />
                    <RefreshCw className="h-7 w-7 text-saffron" />
                  </div>
                  <p className="mt-5 text-base font-extrabold text-paper">Loading the local demo timeline…</p>
                </motion.div>
              ) : record ? (
                <motion.div key={record.caseId} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="relative overflow-hidden rounded-2xl border border-saffron/20 bg-saffron/[0.06] p-5 sm:p-7">
                    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-saffron/[0.12]" />
                    <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border border-saffron/[0.18]" />
                    <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-ink/[0.35] px-3 py-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-saffron">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-saffron" /> Current status
                        </div>
                        <h2 className="mt-5 max-w-2xl text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-4xl">{record.statusLabel}</h2>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-lg border border-white/[0.09] bg-ink/[0.35] px-3 py-2 font-mono text-[0.62rem] font-semibold text-paper">{record.caseId}</span>
                          <span className="rounded-lg border border-white/[0.09] bg-ink/[0.35] px-3 py-2 text-xs font-semibold text-muted">Created {record.createdAt}</span>
                        </div>
                      </div>
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#ffb45f ${record.progress * 3.6}deg, rgba(255,255,255,.06) 0deg)` }}>
                        <div className="absolute inset-2 rounded-full bg-[#101b18]" />
                        <div className="relative text-center">
                          <p className="font-mono text-2xl font-bold text-paper">{record.progress}%</p>
                          <p className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Progress</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <MapPin className="h-4 w-4 text-aqua" />
                      <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">Assigned unit</p>
                      <p className="mt-1.5 text-sm font-bold leading-5 text-paper">{record.assignedUnit}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <ShieldCheck className="h-4 w-4 text-signal" />
                      <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">Incident</p>
                      <p className="mt-1.5 text-sm font-bold leading-5 text-paper">{incidentTitle}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <Clock3 className="h-4 w-4 text-saffron" />
                      <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">Next action</p>
                      <p className="mt-1.5 text-sm font-bold leading-5 text-paper">Wait for the next timeline update</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_19rem]">
                    <div>
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="eyebrow">Case timeline</p>
                          <h3 className="mt-2 text-xl font-extrabold text-paper">Every stage, in human language.</h3>
                        </div>
                      </div>
                      <div className="relative ml-3 border-l border-white/[0.10] pl-7">
                        {record.timeline.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="relative pb-8 last:pb-0">
                            <span className={cx(
                              'absolute -left-[2.23rem] top-0 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#0b1715]',
                              item.status === 'done' && 'bg-signal text-ink',
                              item.status === 'active' && 'bg-saffron shadow-[0_0_20px_rgba(255,180,95,.35)]',
                              item.status === 'pending' && 'bg-[#263633]',
                            )}>
                              {item.status === 'done' ? <Check className="h-2.5 w-2.5" /> : null}
                            </span>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                              <div>
                                <p className={cx('text-sm font-extrabold', item.status === 'pending' ? 'text-muted' : 'text-paper')}>{item.label}</p>
                                <p className="mt-1 max-w-xl text-xs leading-5 text-muted">{item.detail}</p>
                              </div>
                              <span className={cx('shrink-0 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em]', item.status === 'active' ? 'text-saffron' : 'text-muted')}>{item.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <aside className="space-y-4">
                      <div className="rounded-2xl border border-aqua/[0.15] bg-aqua/[0.045] p-5">
                        <div className="flex items-center gap-2 text-sm font-extrabold text-paper"><Info className="h-4 w-4 text-aqua" /> What happens next</div>
                        <p className="mt-3 text-xs leading-5 text-muted">The active stage is shown in amber. In a real integration, notifications would appear only when an official case event is received.</p>
                      </div>
                      <Button variant="secondary" size="lg" className="w-full" onClick={() => downloadStatus(record)}>
                        <Download className="h-4 w-4" /> Download status
                      </Button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(record.caseId).catch(() => undefined)}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-muted hover:bg-white/[0.04] hover:text-paper"
                      >
                        <Copy className="h-4 w-4" /> Copy reference
                      </button>
                    </aside>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] p-8 text-center">
                  <div className="absolute inset-0 bg-radial-grid bg-[length:20px_20px] opacity-[0.15] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-saffron/[0.18] bg-saffron/[0.055] text-saffron">
                    <FileClock className="h-7 w-7" />
                  </span>
                  <h3 className="relative mt-5 text-xl font-extrabold tracking-[-0.03em] text-paper">A timeline you can actually understand.</h3>
                  <p className="relative mt-2 max-w-md text-sm leading-6 text-muted">Enter a local demo reference or use the reviewer case to see assignment, progress and next action.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReference(defaultDemoCase.caseId)
                      void runSearch(defaultDemoCase.caseId)
                    }}
                    className={cx(buttonStyles('primary', 'md'), 'relative mt-5')}
                  >
                    Open reviewer demo <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {recentCases.length ? (
          <div className="mx-auto mt-6 max-w-5xl">
            <p className="eyebrow mb-3">Created in this browser</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recentCases.slice(0, 4).map((item) => (
                <button
                  key={item.caseId}
                  type="button"
                  onClick={() => {
                    setReference(item.caseId)
                    void runSearch(item.caseId)
                  }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-left hover:border-white/[0.15] hover:bg-white/[0.045]"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-paper">{item.caseId}</p>
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
