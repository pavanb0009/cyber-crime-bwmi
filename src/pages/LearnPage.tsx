import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { safetyGuides } from '../data/content'
import { cx } from '../lib/cx'

const categories = ['All', 'Money', 'Accounts', 'Harassment', 'Family', 'General'] as const

const quickActions = [
  {
    title: 'Money moved',
    action: 'Call 1930 first',
    detail: 'Then contact your bank or payment provider.',
    href: 'tel:1930',
    external: true,
  },
  {
    title: 'Account taken over',
    action: 'Secure access',
    detail: 'Change passwords from a trusted device and sign out other sessions.',
    href: '/report?type=account',
    external: false,
  },
  {
    title: 'Threats or harassment',
    action: 'Preserve evidence',
    detail: 'Save links, timestamps and messages before blocking.',
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
          tone: 'solid',
        }
      : score >= 1
        ? {
            title: 'Pause and verify independently.',
            detail: 'One signal can be enough to justify caution. Open the official service directly or call a trusted number you already know.',
            tone: 'filled',
          }
        : {
            title: 'No selected warning signals — still verify.',
            detail: 'This checklist cannot certify safety. Check the identifier and use an independent trusted channel before acting.',
            tone: 'outline',
          }

  return (
    <>
      <PageIntro
        eyebrow="Learning corner"
        title="Safety advice for the next five minutes."
        description="Long awareness pages become short, situation-based playbooks: what to do now, what evidence to keep, and what never to share."
        aside="Clear language, no shame, and an action in every section."
      />

      <section id="safety" className="page-shell scroll-mt-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((item) => {
            const inner = (
              <>
                <p className="eyebrow text-brand">{item.title}</p>
                <h2 className="mt-2 text-[1.05rem] font-semibold text-paper group-hover:text-brand">{item.action}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </>
            )
            const className = 'card group block p-5 transition hover:border-brand/50'
            return item.external ? (
              <a key={item.title} href={item.href} className={className}>{inner}</a>
            ) : (
              <Link key={item.title} to={item.href} className={className}>{inner}</Link>
            )
          })}
        </div>
      </section>

      <section id="digest" className="page-shell page-section scroll-mt-24">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr] lg:gap-8">
          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Situation playbooks</p>
                <h2 className="section-title mt-2">Find the right guide.</h2>
              </div>
              <span className="text-sm text-muted">{filteredGuides.length} results</span>
            </div>

            <div className="surface p-4 sm:p-5">
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
                      '-mb-px shrink-0 border-b-2 py-2 text-sm transition',
                      category === item
                        ? 'border-brand font-semibold text-brand'
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
                  <div key={guide.id} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenGuide(open ? null : guide.id)}
                      className="flex w-full items-start justify-between gap-5 p-5 text-left sm:p-6"
                      aria-expanded={open}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          <span>{guide.category}</span>
                          <span aria-hidden>·</span>
                          <span>{guide.readingTime}</span>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-paper sm:text-xl">{guide.title}</h3>
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
                  <button type="button" onClick={() => { setQuery(''); setCategory('All') }} className="link-accent mt-3 text-sm">Clear filters</button>
                </div>
              ) : null}
            </div>
          </div>

          <aside id="awareness" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5 sm:p-6">
              <div>
                <p className="eyebrow">60-second check</p>
                <h2 className="section-title mt-2">Does this feel like a scam?</h2>
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
                        ? 'border-brand bg-brand/[0.05]'
                        : 'border-black/[0.10] bg-white hover:border-brand/40',
                    )}
                  >
                    <span className={cx(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                      answers[index] ? 'border-brand bg-brand text-ink' : 'border-black/20 text-transparent',
                    )}>
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-medium leading-5 text-paper">{question}</span>
                  </button>
                ))}
              </div>

              <motion.div
                layout
                className={cx(
                  'mt-5 rounded-2xl border p-4',
                  assessment.tone === 'solid' && 'border-alert bg-alert',
                  assessment.tone === 'filled' && 'border-alert/30 bg-alert/[0.05]',
                  assessment.tone === 'outline' && 'border-brand/30 bg-brand/[0.04]',
                )}
              >
                <p className={cx('text-sm font-semibold', assessment.tone === 'solid' ? 'text-ink' : 'text-paper')}>
                  {assessment.title}
                </p>
                <p className={cx('mt-1.5 text-xs leading-5', assessment.tone === 'solid' ? 'text-white/75' : 'text-muted')}>
                  {assessment.detail}
                </p>
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

            <p className="mt-5 text-sm leading-6 text-muted">For immediate physical danger, contact local emergency services. This prototype is not a substitute for professional or legal advice.</p>
          </aside>
        </div>
      </section>
    </>
  )
}
