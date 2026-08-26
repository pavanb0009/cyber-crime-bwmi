import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BadgeIndianRupee,
  BookOpen,
  FileSearch,
  FileText,
  ImagePlus,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  UserRoundX,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { cx } from '../lib/cx'
import { classifyIncident } from '../lib/intelligence'
import type { CopilotResult } from '../types'

const heroCards = [
  {
    src: '/cards/women_children.png',
    icon: ShieldCheck,
    label: 'Women & children',
    action: 'Report anonymously',
    to: '/report?type=women-child&anonymous=1',
    offset: 'md:mt-8',
    visibility: '',
  },
  {
    src: '/cards/financial_fraud.png',
    icon: BadgeIndianRupee,
    label: 'Financial fraud',
    action: 'Call 1930 first',
    to: 'tel:1930',
    offset: 'md:mt-4',
    visibility: '',
  },
  {
    src: '/cards/hacked_account.png',
    icon: UserRoundX,
    label: 'Hacked account',
    action: 'Secure & report',
    to: '/report?type=account',
    offset: '',
    visibility: '',
  },
  {
    src: '/cards/suspicious_number.png',
    icon: Search,
    label: 'Suspicious number',
    action: 'Check identifier',
    to: '/check',
    offset: 'md:mt-4',
    visibility: '',
  },
  {
    src: '/cards/your_complaint.png',
    icon: FileSearch,
    label: 'Your complaint',
    action: 'Track status',
    to: '/track',
    offset: 'md:mt-8',
    visibility: 'hidden md:block',
  },
] as const

const learningItems = [
  {
    title: 'Citizen manual',
    description: 'Four short steps to file a demo complaint, save a draft and keep the acknowledgement number.',
    href: '/learn',
    icon: BookOpen,
    iconClass: 'bg-[#e8f1fb] text-brand',
  },
  {
    title: 'Cyber safety tips',
    description: 'What to do in the first five minutes after money moves, an account is taken, or a threat arrives.',
    href: '/learn#safety',
    icon: ShieldCheck,
    iconClass: 'bg-[#e7f6ec] text-[#1f8a4c]',
  },
  {
    title: 'Cyber awareness',
    description: 'A 60-second check for pressure, OTP requests, unfamiliar UPI IDs and guaranteed refunds.',
    href: '/learn#awareness',
    icon: Monitor,
    iconClass: 'bg-[#eef1f6] text-[#2b4c7e]',
  },
  {
    title: 'Daily digest',
    description: 'Short situation playbooks instead of long awareness pages — money, accounts, family and general.',
    href: '/learn#digest',
    icon: FileText,
    iconClass: 'bg-[#f8f1e3] text-[#b45309]',
  },
]

function HeroCard({
  src,
  icon: Icon,
  label,
  action,
  to,
  offset,
  visibility,
}: {
  src: string
  icon: LucideIcon
  label: string
  action: string
  to: string
  offset: string
  visibility: string
}) {
  const [loaded, setLoaded] = useState(false)
  const isPhone = to.startsWith('tel:')
  const content = (
    <>
      <span className="flex items-center gap-1.5 text-[0.78rem] font-semibold leading-tight text-paper">
        <Icon className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
        {label}
      </span>
      <span
        className={cx(
          'mt-2 inline-flex items-center gap-1 text-[0.74rem] font-semibold',
          isPhone ? 'text-alert' : 'text-brand',
        )}
      >
        {action}
        <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </>
  )

  const cardClass = cx(
    'group block w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-white shadow-[0_14px_34px_rgba(16,16,18,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(16,16,18,0.14)]',
    offset,
    visibility,
  )

  const body = (
    <>
      <span className="relative block aspect-[6/7] w-full bg-white">
        <img
          src={src}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
          className={cx(
            'absolute inset-0 h-full w-full object-contain p-2',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
        {!loaded ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <ImagePlus className="h-6 w-6 text-[#d6dbe2]" aria-hidden />
          </span>
        ) : null}
      </span>
      <span className="block border-t border-black/[0.05] px-3.5 py-3 text-left">{content}</span>
    </>
  )

  return isPhone ? (
    <a href={to} className={cardClass}>
      {body}
    </a>
  ) : (
    <Link to={to} className={cardClass}>
      {body}
    </Link>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [copilotText, setCopilotText] = useState('')
  const [copilotResult, setCopilotResult] = useState<CopilotResult | null>(null)

  function runCopilot() {
    if (copilotText.trim().length < 12) return
    setCopilotResult(classifyIncident(copilotText))
  }

  function openCopilotRoute() {
    if (!copilotResult) return
    const encoded = encodeURIComponent(copilotText)
    if (copilotResult.incidentType === 'financial') {
      navigate(`/report?type=financial&mode=emergency&story=${encoded}`)
    } else {
      navigate(`/report?type=${copilotResult.incidentType}&story=${encoded}`)
    }
  }

  return (
    <>
      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col justify-center py-8">
         <img
          src="/hero3.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center"
        /> 

        <div className="page-shell flex flex-col items-center text-center">
          <p className="inline-flex rounded-full bg-brand/[0.08] px-3 py-1 text-[0.75rem] font-medium text-brand">
            Independent prototype · fictional data only
          </p>

          <h1 className="mt-3.5 max-w-[22ch] text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.06] tracking-[-0.04em] text-paper">
            Report cybercrime clearly.
          </h1>

          <p className="mt-2.5 max-w-lg text-[0.95rem] leading-6 text-muted">
            File a complaint, check a number, or track a demo case — short steps, plain language, no menu maze.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <Link to="/report" className={cx(buttonStyles('primary', 'md'), 'rounded-full px-6')}>
              Start a report
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/report?type=financial&mode=emergency" className={cx(buttonStyles('danger', 'md'), 'rounded-full px-6')}>
              <Zap className="h-4 w-4" aria-hidden />
              I just lost money
            </Link>
            <a href="tel:1930" className={cx(buttonStyles('secondary', 'md'), 'rounded-full px-6')}>
              Call 1930
            </a>
          </div>
        </div>

        <div className="page-shell mt-8 sm:mt-10">
          <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-5">
            {heroCards.map((card) => (
              <HeroCard key={card.src} {...card} />
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-brand/20 bg-white/90 p-4 text-left shadow-card backdrop-blur sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow text-brand">Cybercrime Copilot</p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-paper">Not sure what category this is?</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Describe it naturally. The local demo classifier selects the likely incident and route.</p>
              </div>
              <span className="pill-badge shrink-0"><Sparkles className="h-3.5 w-3.5" /> Simulated classification</span>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <textarea value={copilotText} onChange={(event) => { setCopilotText(event.target.value.slice(0, 500)); setCopilotResult(null) }} className="text-area min-h-24 flex-1" placeholder="Someone called claiming to be CBI and made my father transfer ₹2 lakh…" />
              <div className="flex shrink-0 flex-row gap-2 sm:w-40 sm:flex-col">
                <button type="button" onClick={runCopilot} className={cx(buttonStyles('primary', 'md'), 'flex-1')}>Understand it</button>
                <button type="button" onClick={() => setCopilotText('Someone called my father claiming to be CBI and said his Aadhaar was involved in money laundering. They made him transfer ₹2 lakh.')} className={cx(buttonStyles('secondary', 'md'), 'flex-1')}>Use demo</button>
              </div>
            </div>
            {copilotResult ? (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-black/[0.08] bg-mist p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand">{copilotResult.severity} · {copilotResult.route}</p><p className="mt-1 text-sm font-semibold text-paper">{copilotResult.label}</p><p className="mt-1 text-xs leading-5 text-muted">{copilotResult.signals.join(' · ')}</p></div>
                <button type="button" onClick={openCopilotRoute} className={copilotResult.incidentType === 'financial' ? buttonStyles('danger', 'md') : buttonStyles('primary', 'md')}>Open recommended route <ArrowRight className="h-4 w-4" /></button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#f3f4f6] py-10 sm:py-12">
        <div className="page-shell">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-paper sm:text-2xl">Learning Corner</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {learningItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className="group flex flex-col rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-brand/40 hover:shadow-card"
                >
                  <span className={cx('inline-flex h-11 w-11 items-center justify-center rounded-lg', item.iconClass)}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[0.95rem] font-bold uppercase tracking-[0.04em] text-paper">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:text-brandDark">
                    Read More
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
