import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeIndianRupee,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  LockKeyhole,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { brand } from '../data/brand'
import { incidentTypes } from '../data/content'
import { cx } from '../lib/cx'
import { defaultDemoCase, findCase, loadCases } from '../lib/storage'
import type { CaseRecord, MoneyRecovery } from '../types'

function getCase(reference: string): CaseRecord | undefined {
  const clean = reference.trim().toUpperCase()
  if (clean === defaultDemoCase.caseId) return defaultDemoCase
  return findCase(clean)
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function downloadStatus(record: CaseRecord) {
  const lines = [
    `${brand.name.toUpperCase()} — DEMO CASE STATUS`,
    `${brand.disclaimer} This is not an official complaint record.`,
    '',
    `Reference: ${record.caseId}`,
    `Created: ${record.createdAt}`,
    `Status: ${record.statusLabel}`,
    `Progress: ${record.progress}%`,
    `Assigned unit: ${record.assignedUnit}`,
    `Next action: ${record.nextAction ?? '—'}`,
    record.recovery ? `Reported: ${formatMoney(record.recovery.reported)} | Traced: ${formatMoney(record.recovery.traced)} | Lien: ${formatMoney(record.recovery.lien)} | Restoration eligible: ${formatMoney(record.recovery.restorationEligible)}` : '',
    '',
    'TIMELINE',
    ...record.timeline.map((item) => `- ${item.label} | ${item.timestamp} | ${item.detail}`),
  ].filter(Boolean)
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${record.caseId}-status.txt`
  anchor.click()
  URL.revokeObjectURL(url)
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
          <p className="eyebrow text-brand">Money recovery tracker · simulated</p>
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
                  {index < activeIndex ? <Check className="h-3 w-3 text-white" /> : null}
                </span>
                <p className={cx('mt-2 text-xs font-semibold', index <= activeIndex ? 'text-paper' : 'text-muted')}>{item.label}</p>
                <p className="mt-1 font-mono text-[0.58rem] text-muted">{item.amount ? formatMoney(item.amount) : 'Pending'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">All amounts and bank actions are synthetic. This visualization demonstrates recovery visibility; it does not represent a live banking status.</p>
    </div>
  )
}

export function TrackPage() {
  const [searchParams] = useSearchParams()
  const initialCase = searchParams.get('case') ?? ''
  const [reference, setReference] = useState(initialCase)
  const [record, setRecord] = useState<CaseRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentCases, setRecentCases] = useState<CaseRecord[]>([])
  const [freezeOpen, setFreezeOpen] = useState(false)
  const [freezeResult, setFreezeResult] = useState(false)
  const [freezeForm, setFreezeForm] = useState({ bank: '', last4: '', amount: '', complaint: '', unit: '' })

  useEffect(() => {
    setRecentCases(loadCases())
    if (initialCase) void runSearch(initialCase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSearch(value = reference) {
    const clean = value.trim().toUpperCase()
    if (!clean) {
      setError('Enter a demo acknowledgement number.')
      setRecord(null)
      return
    }
    setError('')
    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 520))
    const found = getCase(clean)
    if (!found) {
      setRecord(null)
      setError('No local demo case matches that reference. Try the reviewer demo case.')
    } else {
      setRecord(found)
      setReference(found.caseId)
    }
    setLoading(false)
  }

  const incidentTitle = record ? incidentTypes.find((item) => item.id === record.incidentType)?.title ?? record.incidentType : ''
  const currentStage = useMemo(() => record?.timeline.find((item) => item.status === 'active'), [record])

  return (
    <>
      <PageIntro
        eyebrow="Track complaint & recovery"
        title="Status without the mystery."
        description="See a human-readable case timeline, current owner, next action and — for financial fraud — a clear reported → traced → lien → restoration journey."
        aside={<button type="button" onClick={() => { setReference(defaultDemoCase.caseId); void runSearch(defaultDemoCase.caseId) }} className="w-full text-left"><p className="text-sm font-medium text-paper">Use the full recovery demo</p><p className="link-accent mt-1 font-mono text-sm">{defaultDemoCase.caseId}</p></button>}
      />

      <section className="page-shell pb-4">
        <div className="card mx-auto max-w-5xl overflow-hidden">
          <div className="border-b border-black/[0.07] p-5 sm:p-6">
            <form onSubmit={(event) => { event.preventDefault(); void runSearch() }}>
              <label htmlFor="caseReference" className="field-label">Demo acknowledgement number</label>
              <div className="relative">
                <input id="caseReference" value={reference} onChange={(event) => { setReference(event.target.value.toUpperCase()); setError('') }} className="text-field h-12 pr-24 font-mono text-sm uppercase tracking-[0.04em]" placeholder={defaultDemoCase.caseId} autoComplete="off" />
                <Button type="submit" size="md" loading={loading} className="absolute right-1 top-1 h-10">Track</Button>
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted">Only cases created in this browser and the reviewer demo case are available.</p><button type="button" onClick={() => { setReference(defaultDemoCase.caseId); void runSearch(defaultDemoCase.caseId) }} className="link-accent text-left text-sm">Fill demo reference</button></div>
              {error ? <p className="mt-3 text-sm font-semibold text-alert">{error}</p> : null}
            </form>
          </div>

          <div className="min-h-[24rem] p-5 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[16rem] flex-col justify-center"><div className="scan-line max-w-md" /><p className="mt-5 text-base font-medium text-paper">Loading the local demo timeline…</p></motion.div>
              ) : record ? (
                <motion.div key={record.caseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="text-sm text-muted">Current status</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-paper sm:text-3xl">{record.statusLabel}</h2><p className="mt-4 text-sm text-muted"><span className="font-mono font-semibold text-paper">{record.caseId}</span> · Created {record.createdAt} · {record.progress}% complete</p></div>
                    <span className="pill-badge self-start"><LockKeyhole className="h-3.5 w-3.5" /> Local demo record</span>
                  </div>

                  <div className="mt-6 grid gap-6 border-y border-black/[0.07] py-5 sm:grid-cols-3">
                    <div><p className="eyebrow">Assigned unit</p><p className="mt-2 text-sm font-medium leading-6 text-paper">{record.assignedUnit}</p></div>
                    <div><p className="eyebrow">Incident</p><p className="mt-2 text-sm font-medium leading-6 text-paper">{incidentTitle}</p></div>
                    <div><p className="eyebrow">Next action</p><p className="mt-2 text-sm font-medium leading-6 text-paper">{record.nextAction ?? currentStage?.detail ?? 'Wait for the next timeline update'}</p></div>
                  </div>

                  {record.recovery ? <div className="mt-7"><MoneyRecoveryTracker recovery={record.recovery} /></div> : null}

                  <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
                    <div>
                      <div className="mb-5"><p className="eyebrow">Case timeline</p><h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper">Every stage, in human language.</h3></div>
                      <div className="relative ml-3 border-l border-black/[0.10] pl-7">
                        {record.timeline.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="relative pb-8 last:pb-0">
                            <span className={cx('absolute -left-[2.23rem] top-0 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white', item.status === 'done' && 'bg-brand', item.status === 'active' && 'bg-white ring-[3px] ring-inset ring-brand', item.status === 'pending' && 'bg-black/15')}>{item.status === 'done' ? <Check className="h-2.5 w-2.5 text-white" /> : null}</span>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><div><p className={cx('text-sm font-semibold', item.status === 'pending' ? 'text-muted' : 'text-paper')}>{item.label}</p><p className="mt-1 max-w-xl text-xs leading-5 text-muted">{item.detail}</p></div><span className={cx('shrink-0 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em]', item.status === 'active' ? 'text-brand' : 'text-muted')}>{item.timestamp}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <aside className="space-y-4">
                      <div className="surface-soft p-5"><p className="text-sm font-medium text-paper">Evidence readiness</p><p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-paper">{record.evidenceCompleteness ?? 0}%</p><p className="mt-1 text-xs leading-5 text-muted">{record.evidenceCount ?? 0} evidence items in the local case package.</p></div>
                      <Button variant="secondary" size="lg" className="w-full" onClick={() => downloadStatus(record)}>Download status</Button>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(record.caseId).catch(() => undefined)} className="flex h-11 w-full items-center justify-center text-sm text-muted hover:text-paper">Copy reference</button>
                    </aside>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[16rem] flex-col justify-center"><FileCheck2 className="h-8 w-8 text-brand" /><h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-paper">A timeline you can actually understand.</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted">Enter a local demo reference or open the prepared recovery case to see assignment, money tracing, lien and next action.</p><button type="button" onClick={() => { setReference(defaultDemoCase.caseId); void runSearch(defaultDemoCase.caseId) }} className={cx(buttonStyles('primary', 'md'), 'mt-5 w-fit')}>Open recovery demo</button></motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
          <button type="button" onClick={() => setFreezeOpen((value) => !value)} className="flex w-full items-center justify-between gap-5 p-5 text-left sm:p-6">
            <div className="flex items-start gap-3"><Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brand" /><div><p className="text-sm font-semibold text-paper">My bank account is frozen / lien-marked</p><p className="mt-1 text-sm leading-6 text-muted">Optional demo support flow for citizens affected during a cybercrime investigation.</p></div></div><ChevronRight className={cx('h-4 w-4 shrink-0 text-muted transition', freezeOpen && 'rotate-90')} />
          </button>

          <AnimatePresence initial={false}>
            {freezeOpen ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="border-t border-black/[0.07] p-5 sm:p-6">
                  {!freezeResult ? (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div><label className="field-label" htmlFor="freezeBank">Bank</label><input id="freezeBank" value={freezeForm.bank} onChange={(event) => setFreezeForm((current) => ({ ...current, bank: event.target.value }))} className="text-field" placeholder="Demo Bank" /></div>
                        <div><label className="field-label" htmlFor="freezeLast4">Account last 4 digits</label><input id="freezeLast4" inputMode="numeric" value={freezeForm.last4} onChange={(event) => setFreezeForm((current) => ({ ...current, last4: event.target.value.replace(/\D/g, '').slice(0, 4) }))} className="text-field" placeholder="4821" /></div>
                        <div><label className="field-label" htmlFor="freezeAmount">Lien amount</label><input id="freezeAmount" value={freezeForm.amount} onChange={(event) => setFreezeForm((current) => ({ ...current, amount: event.target.value }))} className="text-field" placeholder="3,000" /></div>
                        <div><label className="field-label" htmlFor="freezeComplaint">Complaint number</label><input id="freezeComplaint" value={freezeForm.complaint} onChange={(event) => setFreezeForm((current) => ({ ...current, complaint: event.target.value }))} className="text-field" placeholder="DEMO-CASE-3000" /></div>
                        <div className="sm:col-span-2"><label className="field-label" htmlFor="freezeUnit">State / police unit</label><input id="freezeUnit" value={freezeForm.unit} onChange={(event) => setFreezeForm((current) => ({ ...current, unit: event.target.value }))} className="text-field" placeholder="Telangana Cyber Cell" /></div>
                      </div>
                      <div className="mt-5 flex gap-2"><Button onClick={() => { if (!freezeForm.bank) setFreezeForm({ bank: 'Demo Bank', last4: '4821', amount: '3,000', complaint: 'DEMO-TG-3000', unit: 'Telangana Cyber Cell' }); setFreezeResult(true) }}>Check demo status</Button><Button variant="ghost" onClick={() => setFreezeForm({ bank: 'Demo Bank', last4: '4821', amount: '3,000', complaint: 'DEMO-TG-3000', unit: 'Telangana Cyber Cell' })}>Fill demo</Button></div>
                    </>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="rounded-2xl border border-brand/20 bg-brand/[0.035] p-5">
                        <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand" /><p className="eyebrow text-brand">Lien help · simulated result</p></div>
                        <h3 className="mt-3 text-xl font-semibold text-paper">Why is my account affected?</h3>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {[
                            ['Disputed transaction', '₹3,000'],
                            ['Current lien', '₹3,000'],
                            ['Police jurisdiction', freezeForm.unit || 'Telangana Cyber Cell'],
                            ['Status', 'Verification required'],
                          ].map(([label, value]) => <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-3"><p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.1em] text-muted">{label}</p><p className="mt-1 text-sm font-semibold text-paper">{value}</p></div>)}
                        </div>
                        <p className="mt-5 text-sm font-semibold text-paper">Documents likely needed</p>
                        <p className="mt-2 text-sm leading-6 text-muted">Bank statement · ID/PAN · transaction explanation · proof of legitimate payment</p>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button><BadgeIndianRupee className="h-4 w-4" /> Prepare clarification</Button><Button variant="secondary" onClick={() => setFreezeResult(false)}>Check another</Button></div>
                        <p className="mt-4 text-xs leading-5 text-muted">Prototype guidance only. This does not query a bank or police database and cannot remove a lien.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {recentCases.length ? (
          <div className="mx-auto mt-6 max-w-5xl"><p className="eyebrow mb-3">Created in this browser</p><div className="grid gap-2 sm:grid-cols-2">{recentCases.slice(0, 4).map((item) => <button key={item.caseId} type="button" onClick={() => { setReference(item.caseId); void runSearch(item.caseId) }} className="group flex items-center justify-between gap-4 rounded-xl border border-black/[0.08] px-4 py-3 text-left transition hover:border-brand/50 hover:bg-mist"><div><p className="font-mono text-xs font-bold text-paper group-hover:text-brand">{item.caseId}</p><p className="mt-1 text-[0.68rem] text-muted">{item.statusLabel}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-muted" /></button>)}</div></div>
        ) : null}
      </section>
    </>
  )
}
