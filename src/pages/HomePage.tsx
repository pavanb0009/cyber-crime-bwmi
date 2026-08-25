import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  EyeOff,
  FileSearch,
  Fingerprint,
  Gauge,
  HeartHandshake,
  MessagesSquare,
  PhoneCall,
  Radar,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { SectionLabel } from '../components/SectionLabel'
import { cx } from '../lib/cx'

const triageOptions = [
  {
    id: 'financial',
    label: 'Money left my account',
    short: 'Financial fraud',
    icon: BadgeIndianRupee,
    title: 'Call 1930 before filing online.',
    detail: 'Then gather the transaction ID, amount, time and receiving account or UPI handle.',
    cta: 'Start financial report',
    route: '/report?type=financial',
    urgent: true,
  },
  {
    id: 'account',
    label: 'Someone took my account',
    short: 'Account takeover',
    icon: CircleUserRound,
    title: 'Secure access from a trusted device.',
    detail: 'Change the password, sign out other sessions and preserve login alerts before reporting.',
    cta: 'Report account misuse',
    route: '/report?type=account',
    urgent: false,
  },
  {
    id: 'harassment',
    label: 'I am being threatened',
    short: 'Harassment',
    icon: MessagesSquare,
    title: 'Preserve the conversation first.',
    detail: 'Save screenshots, profile links and timestamps. Block after evidence is safely captured.',
    cta: 'Start a sensitive report',
    route: '/report?type=harassment',
    urgent: false,
  },
  {
    id: 'check',
    label: 'Check a number or link',
    short: 'Suspect check',
    icon: FileSearch,
    title: 'Pause before you pay or reply.',
    detail: 'Search a phone number, UPI ID, email or website in the synthetic demo repository.',
    cta: 'Open suspect checker',
    route: '/check',
    urgent: false,
  },
]

function NetworkField() {
  const nodes = [
    [73, 91], [147, 55], [220, 94], [299, 48], [375, 97], [451, 58],
    [104, 168], [191, 151], [273, 178], [355, 146], [437, 184],
    [62, 244], [153, 225], [240, 259], [329, 226], [417, 266], [487, 228],
    [102, 322], [188, 302], [280, 338], [367, 307], [458, 348],
  ]
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 7], [2, 7], [2, 8],
    [3, 9], [4, 9], [4, 10], [6, 7], [7, 8], [8, 9], [9, 10], [6, 11], [6, 12],
    [7, 12], [8, 13], [9, 14], [10, 14], [10, 16], [11, 12], [12, 13], [13, 14],
    [14, 15], [15, 16], [11, 17], [12, 18], [13, 19], [14, 20], [15, 21], [16, 21],
    [17, 18], [18, 19], [19, 20], [20, 21], [7, 13], [9, 13], [13, 20],
  ]

  return (
    <div className="absolute inset-x-0 top-0 h-[62%] overflow-hidden rounded-t-[1.8rem]">
      <div className="absolute inset-0 bg-radial-grid bg-[length:18px_18px] opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="absolute left-[38%] top-[36%] h-32 w-32 rounded-full border border-signal/25">
        <div className="absolute inset-3 rounded-full border border-signal/[0.15]" />
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_35px_rgba(199,255,103,.7)]" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full border border-signal/60" />
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 540 390" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="540" y2="390">
            <stop stopColor="#72E5DF" stopOpacity="0.08" />
            <stop offset="0.55" stopColor="#C7FF67" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {edges.map(([from, to], index) => (
          <line
            key={index}
            x1={nodes[from][0]}
            y1={nodes[from][1]}
            x2={nodes[to][0]}
            y2={nodes[to][1]}
            stroke="url(#edge)"
            strokeWidth="1"
          />
        ))}
        {nodes.map(([x, y], index) => (
          <g key={index}>
            <circle cx={x} cy={y} r={index === 13 ? 5 : 2.6} fill={index === 13 ? '#C7FF67' : '#72E5DF'} opacity={index === 13 ? 1 : 0.45} />
            {index === 13 ? <circle cx={x} cy={y} r="14" stroke="#C7FF67" opacity="0.25" /> : null}
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-signal/60 to-transparent shadow-[0_0_20px_rgba(199,255,103,.55)]" />
    </div>
  )
}

function TriageConsole() {
  const [selected, setSelected] = useState('financial')
  const navigate = useNavigate()
  const current = useMemo(
    () => triageOptions.find((item) => item.id === selected) ?? triageOptions[0],
    [selected],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 0.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, delay: 0.12 }}
      className="signal-border noise relative min-h-[38rem] overflow-hidden rounded-[1.8rem] bg-[#0a1513] p-4 shadow-signal sm:p-5"
    >
      <NetworkField />
      <div className="relative z-10 flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted">
          <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_12px_rgba(199,255,103,.75)]" />
          Citizen response navigator
        </div>
        <span className="rounded-full border border-white/10 bg-ink/60 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-paper/60">
          Demo mode
        </span>
      </div>

      <div className="relative z-10 mt-[14.7rem] rounded-[1.45rem] border border-white/[0.09] bg-[#0d1c19]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-aqua">Start here</p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-[-0.035em] text-paper sm:text-2xl">
              What happened?
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-aqua/20 bg-aqua/[0.06] text-aqua">
            <Radar className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {triageOptions.map((option) => {
            const Icon = option.icon
            const active = option.id === selected
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                className={cx(
                  'flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition',
                  active
                    ? 'border-signal/[0.35] bg-signal/[0.09] text-paper shadow-[inset_0_0_0_1px_rgba(199,255,103,.06)]'
                    : 'border-white/[0.07] bg-white/[0.025] text-muted hover:border-white/[0.15] hover:text-paper',
                )}
              >
                <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', active ? 'bg-signal text-ink' : 'bg-white/[0.05] text-aqua')}>
                  <Icon className="h-4 w-4" />
                </span>
                {option.label}
              </button>
            )
          })}
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cx(
            'mt-3 rounded-xl border p-3.5',
            current.urgent ? 'border-coral/20 bg-coral/[0.07]' : 'border-white/[0.07] bg-ink/[0.55]',
          )}
        >
          <div className="flex items-start gap-3">
            {current.urgent ? (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            )}
            <div>
              <p className="text-sm font-bold text-paper">{current.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{current.detail}</p>
            </div>
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => navigate(current.route)}
          className="group mt-3 flex h-12 w-full items-center justify-between rounded-xl bg-paper px-4 text-sm font-extrabold text-ink transition hover:bg-white"
        >
          {current.cta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  )
}

const actionCards = [
  {
    number: '01',
    title: 'Report cybercrime',
    description: 'A guided four-step complaint journey with autosave, evidence review and a demo acknowledgement.',
    href: '/report',
    icon: Fingerprint,
    className: 'md:col-span-2 lg:col-span-2',
    accent: 'signal',
  },
  {
    number: '02',
    title: 'Check a suspect',
    description: 'Search a phone, UPI ID, email or URL before you trust it.',
    href: '/check',
    icon: FileSearch,
    className: '',
    accent: 'aqua',
  },
  {
    number: '03',
    title: 'Track your case',
    description: 'See status, assigned unit and the next expected action.',
    href: '/track',
    icon: Gauge,
    className: '',
    accent: 'saffron',
  },
  {
    number: '04',
    title: 'Report sensitively',
    description: 'A protected, anonymous-first route for women and child related incidents.',
    href: '/report?type=women-child',
    icon: EyeOff,
    className: 'md:col-span-2',
    accent: 'coral',
  },
]

const journeySteps = [
  {
    number: '01',
    title: 'Understand the urgency',
    description: 'The interface identifies financial loss and surfaces 1930 before anything else.',
    icon: Clock3,
  },
  {
    number: '02',
    title: 'Choose plain language',
    description: 'Citizens select what happened, not which department or legal category owns it.',
    icon: HeartHandshake,
  },
  {
    number: '03',
    title: 'Preserve useful proof',
    description: 'Contextual prompts explain what evidence helps without demanding technical knowledge.',
    icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Stay informed',
    description: 'A readable timeline replaces opaque status codes with the current stage and next action.',
    icon: Radar,
  },
]

export function HomePage() {
  return (
    <>
      <section className="page-shell pb-14 pt-10 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-aqua/[0.15] bg-aqua/[0.055] px-3 py-2 font-mono text-[0.61rem] font-semibold uppercase tracking-[0.16em] text-aqua">
              <Sparkles className="h-3.5 w-3.5" /> Public service, redesigned around panic
            </div>
            <h1 className="max-w-[13ch] text-[clamp(3.5rem,8vw,7.7rem)] font-extrabold leading-[0.86] tracking-[-0.078em] text-paper">
              Help should move <span className="text-signal">faster</span> than the scam.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              A calmer path from “something happened” to the right action — report an incident, check a suspicious identifier, or understand what happens next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/report" className={buttonStyles('primary', 'lg')}>
                Start a report <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/check" className={buttonStyles('secondary', 'lg')}>
                Check before you trust <FileSearch className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">
              {[
                ['04', 'short steps'],
                ['03', 'core journeys'],
                ['00', 'real data'],
              ].map(([value, label]) => (
                <div key={label} className="bg-[#0a1513] px-3 py-4 sm:px-5">
                  <p className="font-mono text-lg font-bold text-paper sm:text-xl">{value}</p>
                  <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <TriageConsole />
        </div>
      </section>

      <section className="border-y border-coral/[0.15] bg-coral/[0.055]">
        <div className="page-shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral text-ink">
              <PhoneCall className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-paper">Money has already left your account?</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">Call the national cybercrime helpline first, then continue with the online complaint.</p>
            </div>
          </div>
          <a href="tel:1930" className={cx(buttonStyles('danger', 'md'), 'shrink-0')}>
            Call 1930 now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24 lg:py-32">
        <SectionLabel index="01">One portal · three clear outcomes</SectionLabel>
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_.62fr] lg:items-end">
          <h2 className="max-w-4xl text-[clamp(2.7rem,6vw,5.5rem)] font-extrabold leading-[0.94] tracking-[-0.06em] text-paper">
            Everything important. Nothing in the way.
          </h2>
          <p className="max-w-lg text-base leading-7 text-muted lg:justify-self-end">
            The current portal’s primary citizen services are reorganised as obvious tasks instead of a deep menu tree.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {actionCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className={card.className}
              >
                <Link
                  to={card.href}
                  className="group surface-soft relative flex h-full min-h-[15.5rem] flex-col overflow-hidden rounded-[1.55rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.055] sm:p-6"
                >
                  <div className={cx(
                    'absolute inset-x-0 top-0 h-[2px]',
                    card.accent === 'signal' && 'bg-signal',
                    card.accent === 'aqua' && 'bg-aqua',
                    card.accent === 'saffron' && 'bg-saffron',
                    card.accent === 'coral' && 'bg-coral',
                  )} />
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-muted">{card.number}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-paper transition group-hover:scale-105 group-hover:bg-paper group-hover:text-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-auto pt-12">
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-paper sm:text-3xl">{card.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{card.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-paper">
                      Open journey <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#091311] py-20 sm:py-24 lg:py-32">
        <div className="page-shell grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionLabel index="02">Designed for the moment</SectionLabel>
            <h2 className="text-[clamp(2.65rem,5vw,4.8rem)] font-extrabold leading-[0.95] tracking-[-0.058em] text-paper">
              Less portal.<br />More guidance.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted">
              Cyber incidents create urgency, uncertainty and shame. The interface responds with sequence, plain language and visible progress.
            </p>
            <div className="mt-8 rounded-2xl border border-aqua/[0.15] bg-aqua/[0.045] p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                <p className="text-sm leading-6 text-paper/[0.80]">
                  The standout idea is not a chatbot. It is a better decision system that gives the right instruction at the right time.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {journeySteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="group grid gap-5 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-7 sm:py-9"
                >
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-signal">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-[-0.03em] text-paper sm:text-2xl">{step.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">{step.description}</p>
                  </div>
                  <span className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-aqua transition group-hover:border-aqua/25 group-hover:bg-aqua/[0.06] sm:flex">
                    <Icon className="h-5 w-5" />
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24 lg:py-32">
        <SectionLabel index="03">Safety, in plain language</SectionLabel>
        <div className="grid gap-8 lg:grid-cols-[1fr_.55fr] lg:items-end">
          <h2 className="max-w-4xl text-[clamp(2.7rem,6vw,5.5rem)] font-extrabold leading-[0.94] tracking-[-0.06em] text-paper">
            Know what to do before the evidence disappears.
          </h2>
          <Link to="/learn" className={cx(buttonStyles('secondary', 'lg'), 'w-full lg:w-auto lg:justify-self-end')}>
            Open safety library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {[
            {
              icon: BadgeIndianRupee,
              label: 'Financial fraud',
              title: 'Call. Record. Report.',
              detail: 'A clear first-response sequence for UPI, card and banking incidents.',
              accent: 'coral',
            },
            {
              icon: CircleUserRound,
              label: 'Account takeover',
              title: 'Regain control safely.',
              detail: 'Secure sessions and connected accounts before the attacker changes the trail.',
              accent: 'aqua',
            },
            {
              icon: MessagesSquare,
              label: 'Harassment',
              title: 'Preserve, then block.',
              detail: 'Capture URLs, timestamps and messages without escalating the conversation.',
              accent: 'saffron',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="surface-soft rounded-[1.55rem] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">{item.label}</span>
                  <span className={cx(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    item.accent === 'coral' && 'bg-coral/[0.09] text-coral',
                    item.accent === 'aqua' && 'bg-aqua/[0.09] text-aqua',
                    item.accent === 'saffron' && 'bg-saffron/[0.09] text-saffron',
                  )}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.04em] text-paper">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
