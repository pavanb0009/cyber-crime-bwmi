import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeIndianRupee,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Eye,
  FileSearch,
  Filter,
  HeartHandshake,
  Info,
  KeyRound,
  MessageCircleWarning,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { safetyGuides } from '../data/content'
import { cx } from '../lib/cx'

const categories = ['All', 'Money', 'Accounts', 'Harassment', 'Family', 'General'] as const

const quickActions = [
  {
    icon: PhoneCall,
    title: 'Money moved',
    action: 'Call 1930 first',
    detail: 'Then contact your bank or payment provider.',
    accent: 'coral',
    href: 'tel:1930',
    external: true,
  },
  {
    icon: KeyRound,
    title: 'Account taken over',
    action: 'Secure access',
    detail: 'Change passwords from a trusted device and sign out other sessions.',
    accent: 'aqua',
    href: '/report?type=account',
    external: false,
  },
  {
    icon: MessageCircleWarning,
    title: 'Threats or harassment',
    action: 'Preserve evidence',
    detail: 'Save links, timestamps and messages before blocking.',
    accent: 'saffron',
    href: '/report?type=harassment',
    external: false,
  },
]

const scamQuestions = [
  'Are you being pressured to act immediately?',
  'Were you asked for an OTP, PIN or screen access?',
  'Does the payment go to a personal or unfamiliar UPI ID?',
  'Are you promised a guaranteed refund, reward or return?',
  'Do they avoid verification through an official channel?',
]

export function LearnPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const [query, setQuery] = useState('')
  const [openGuide, setOpenGuide] = useState<string | null>(safetyGuides[0].id)
  const [answers, setAnswers] = useState<boolean[]>(scamQuestions.map(() => false))

  const filteredGuides = useMemo(() => {
    const clean = query.trim().toLowerCase()
    return safetyGuides.filter((guide) => {
      const matchesCategory = category === 'All' || guide.category === category
      const matchesQuery =
        !clean ||
        guide.title.toLowerCase().includes(clean) ||
        guide.summary.toLowerCase().includes(clean) ||
        guide.steps.some((step) => step.toLowerCase().includes(clean))
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const score = answers.filter(Boolean).length
  const assessment =
    score >= 3
      ? {
          title: 'Stop. Strong scam signals are present.',
          detail: 'Do not pay, approve a request, share access or continue the conversation. Verify independently and report suspicious identifiers.',
          tone: 'coral',
          icon: TriangleAlert,
        }
      : score >= 1
        ? {
            title: 'Pause and verify independently.',
            detail: 'One signal can be enough to justify caution. Open the official service directly or call a trusted number you already know.',
            tone: 'saffron',
            icon: CircleAlert,
          }
        : {
            title: 'No selected warning signals — still verify.',
            detail: 'This checklist cannot certify safety. Check the identifier and use an independent trusted channel before acting.',
            tone: 'aqua',
            icon: ShieldCheck,
          }

  return (
    <>
      <PageIntro
        index="04"
        eyebrow="Learning corner"
        title={<>Safety advice for<br /><span className="text-signal">the next five minutes.</span></>}
        description="Long awareness pages become short, situation-based playbooks: what to do now, what evidence to keep, and what never to share."
        aside={
          <p className="text-sm leading-6 text-muted">
            Clear language, no shame, and an action in every section.
          </p>
        }
      />

      <section className="page-shell">
        <div className="divide-y divide-black/[0.08] border-y border-black/[0.08] sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {quickActions.map((item) => {
            const inner = (
              <>
                <p className="text-sm text-muted">{item.title}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-paper">{item.action}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </>
            )
            const className = 'block py-6 sm:pr-8 sm:first:pl-0 sm:[&:nth-child(2)]:px-8 sm:last:pl-8 sm:last:pr-0'
            return item.external ? (
              <a key={item.title} href={item.href} className={className}>{inner}</a>
            ) : (
              <Link key={item.title} to={item.href} className={className}>{inner}</Link>
            )
          })}
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] xl:gap-12">
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Situation playbooks</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-paper sm:text-3xl">Find the right guide.</h2>
              </div>
              <span className="text-sm text-muted">{filteredGuides.length} results</span>
            </div>

            <div className="surface rounded-2xl p-4 sm:p-5">
              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="text-field pr-16"
                  placeholder="Search: UPI, password, harassment…"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-paper" aria-label="Clear search">
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="mt-3 flex gap-4 overflow-x-auto border-b border-black/[0.08]">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={cx(
                      '-mb-px shrink-0 border-b py-2 text-sm transition',
                      category === item
                        ? 'border-paper font-medium text-paper'
                        : 'border-transparent text-muted hover:text-paper',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {filteredGuides.map((guide) => {
                const open = openGuide === guide.id
                return (
                  <div key={guide.id} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.025]">
                    <button
                      type="button"
                      onClick={() => setOpenGuide(open ? null : guide.id)}
                      className="flex w-full items-start justify-between gap-5 p-5 text-left sm:p-6"
                      aria-expanded={open}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-muted">{guide.category}</span>
                          <span className="text-sm text-muted">{guide.readingTime}</span>
                        </div>
                        <h3 className="mt-3 text-lg font-extrabold tracking-[-0.025em] text-paper sm:text-xl">{guide.title}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{guide.summary}</p>
                      </div>
                      <span className={cx('mt-1 shrink-0 text-sm text-muted', open && 'text-paper')}>
                        {open ? 'Close' : 'Open'}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="border-t border-black/[0.08] px-5 py-5 sm:px-6">
                            <ol className="space-y-4">
                              {guide.steps.map((step, index) => (
                                <li key={step} className="flex gap-3">
                                  <span className="w-4 shrink-0 text-sm text-muted">{index + 1}</span>
                                  <p className="text-sm leading-6 text-paper">{step}</p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                )
              })}

              {!filteredGuides.length ? (
                <div className="py-8">
                  <p className="text-sm font-medium text-paper">No guide matches that search.</p>
                  <button type="button" onClick={() => { setQuery(''); setCategory('All') }} className="mt-3 text-sm font-medium text-signal">Clear filters</button>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-t border-black/[0.08] pt-2 sm:border sm:p-7 sm:pt-7">
              <div>
                <p className="text-sm text-muted">60-second check</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-paper">Does this feel like a scam?</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">Select every signal that is present. This is guidance, not a safety certificate.</p>

              <div className="mt-6 space-y-2">
                {scamQuestions.map((question, index) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setAnswers((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))}
                    className={cx(
                      'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition',
                      answers[index]
                        ? 'border-signal/25 bg-signal/[0.07]'
                        : 'border-black/[0.07] bg-black/[0.025] hover:border-black/[0.15]',
                    )}
                  >
                    <span className={cx(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                      answers[index] ? 'border-signal bg-signal text-ink' : 'border-black/20 text-transparent',
                    )}>
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-semibold leading-5 text-paper/[0.85]">{question}</span>
                  </button>
                ))}
              </div>

              <motion.div
                layout
                className={cx(
                  'mt-5 rounded-2xl border p-4',
                  assessment.tone === 'coral' && 'border-coral/[0.22] bg-coral/[0.07]',
                  assessment.tone === 'saffron' && 'border-saffron/[0.22] bg-saffron/[0.065]',
                  assessment.tone === 'aqua' && 'border-aqua/20 bg-aqua/[0.055]',
                )}
              >
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-paper">{assessment.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{assessment.detail}</p>
                  </div>
                </div>
              </motion.div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Link to="/check" className={buttonStyles('primary', 'md')}>
                  Check identifier
                </Link>
                <Link to="/report" className={buttonStyles('secondary', 'md')}>
                  Start report
                </Link>
              </div>

              <button type="button" onClick={() => setAnswers(scamQuestions.map(() => false))} className="mt-3 w-full text-center text-xs font-semibold text-muted hover:text-paper">Reset checklist</button>
            </div>

            <p className="mt-6 text-sm leading-6 text-muted">For immediate physical danger, contact local emergency services. This prototype is not a substitute for professional or legal advice.</p>
          </aside>
        </div>
      </section>
    </>
  )
}
