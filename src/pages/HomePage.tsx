import { useMemo, useState } from 'react'
import { ArrowRight, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { brand } from '../data/brand'
import { cx } from '../lib/cx'

const triageOptions = [
  {
    id: 'financial',
    label: 'Money left my account',
    title: 'Call 1930 before filing online.',
    detail: 'Then gather the transaction ID, amount, time and receiving account or UPI handle.',
    cta: 'Start financial report',
    route: '/report?type=financial',
  },
  {
    id: 'account',
    label: 'Someone took my account',
    title: 'Secure access from a trusted device.',
    detail: 'Change the password, sign out other sessions and preserve login alerts before reporting.',
    cta: 'Report account misuse',
    route: '/report?type=account',
  },
  {
    id: 'harassment',
    label: 'I am being threatened',
    title: 'Preserve the conversation first.',
    detail: 'Save screenshots, profile links and timestamps. Block after evidence is safely captured.',
    cta: 'Start a sensitive report',
    route: '/report?type=harassment',
  },
  {
    id: 'check',
    label: 'Check a number or link',
    title: 'Pause before you pay or reply.',
    detail: 'Search a phone number, UPI ID, email or website in the synthetic demo repository.',
    cta: 'Open suspect checker',
    route: '/check',
  },
]

function Triage() {
  const [selected, setSelected] = useState('financial')
  const navigate = useNavigate()
  const current = useMemo(
    () => triageOptions.find((item) => item.id === selected) ?? triageOptions[0],
    [selected],
  )

  return (
    <div className="mx-auto mt-16 max-w-xl text-left">
      <div className="card bg-white/90 p-5 backdrop-blur-sm sm:p-6">
        <p className="eyebrow">Start here</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-paper">What happened?</h2>

        <div className="mt-5 grid gap-2">
          {triageOptions.map((option) => {
            const active = option.id === selected
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                className={cx(
                  'flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-[0.9rem] transition',
                  active
                    ? 'border-brand bg-brand/[0.06] font-semibold text-brand'
                    : 'border-black/[0.10] bg-white text-paper hover:border-brand/40 hover:bg-mist',
                )}
              >
                {option.label}
                {active ? <ArrowRight className="h-4 w-4 shrink-0" aria-hidden /> : null}
              </button>
            )
          })}
        </div>

        <div className="mt-5 border-t border-black/[0.07] pt-5">
          <p className="text-[0.95rem] font-medium text-paper">{current.title}</p>
          <p className="mt-1.5 text-sm leading-6 text-muted">{current.detail}</p>
          <button
            type="button"
            onClick={() => navigate(current.route)}
            className={cx(buttonStyles('primary', 'lg'), 'mt-5 w-full')}
          >
            {current.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

const journeys = [
  {
    title: 'Report cybercrime',
    description: 'Four short steps, autosave, and a demo acknowledgement you can track.',
    href: '/report',
  },
  {
    title: 'Check a suspect',
    description: 'Search a phone, UPI ID, email or URL before you trust it.',
    href: '/check',
  },
  {
    title: 'Track your case',
    description: 'See status, assigned unit and the next expected action in plain language.',
    href: '/track',
  },
  {
    title: 'Report sensitively',
    description: 'An anonymous-first route for women and child related incidents.',
    href: '/report?type=women-child',
  },
]

const principles = [
  {
    title: 'Urgency first',
    description: 'If money has moved, 1930 appears before the form.',
  },
  {
    title: 'Plain language',
    description: 'People choose what happened, not which department owns it.',
  },
  {
    title: 'Useful proof',
    description: 'Prompts explain what evidence helps, without technical jargon.',
  },
  {
    title: 'Readable status',
    description: 'A timeline replaces opaque codes with what is happening now.',
  },
]

const firstResponse = [
  {
    label: 'Financial fraud',
    title: 'Call. Record. Report.',
    detail: 'A clear first-response sequence for UPI, card and banking incidents.',
  },
  {
    label: 'Account takeover',
    title: 'Regain control safely.',
    detail: 'Secure sessions and connected accounts before the attacker changes the trail.',
  },
  {
    label: 'Harassment',
    title: 'Preserve, then block.',
    detail: 'Capture URLs, timestamps and messages without escalating the conversation.',
  },
]

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-16 text-center sm:pt-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="dot-field-full absolute inset-0" />
          <div className="dot-field-fade absolute inset-0">
            <div className="dot-field-side absolute inset-y-0 left-0 w-[32%]" />
            <div className="dot-field-side absolute inset-y-0 right-0 w-[32%] origin-center scale-x-[-1]" />
          </div>
        </div>

        <div className="page-shell relative">
        <Link to="/learn" className="pill-badge mx-auto">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] bg-brand text-[0.55rem] font-bold text-ink">
            New
          </span>
          Independent prototype — fictional data only
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>

        <h1 className="mx-auto mt-7 max-w-[16ch] text-[clamp(2.4rem,6vw,4.4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-paper">
          Help that moves faster than the scam
          <span className="text-brand">.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-7 text-muted">
          A calmer path from “something happened” to the right action — report an incident, check a
          suspicious identifier, or understand what happens next.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/report" className={buttonStyles('primary', 'lg')}>
            Start a report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/check" className={buttonStyles('secondary', 'lg')}>
            Check a number
          </Link>
        </div>

        <a
          href={`tel:${brand.helpline}`}
          className="mx-auto mt-6 flex max-w-md items-center justify-between gap-3 rounded-xl border border-dashed border-black/15 bg-white/70 px-4 py-3 text-left backdrop-blur-sm transition hover:border-brand/40"
        >
          <p className="flex items-center gap-2 font-mono text-[0.8rem] text-paper">
            <Phone className="h-3.5 w-3.5 text-muted" aria-hidden />
            Call {brand.helpline} for financial fraud
          </p>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
        </a>

        <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-sm text-muted hover:text-paper">
          Need a real human? Contact us
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>

        <Triage />
        </div>
      </section>

      <section className="page-shell">
        <div className="flex flex-col gap-4 rounded-2xl bg-alert px-5 py-5 text-ink sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[0.95rem] leading-6">
            Money already left your account? Call 1930 first, then continue online.
          </p>
          <a
            href="tel:1930"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-alert hover:bg-white/90"
          >
            Call 1930
          </a>
        </div>
      </section>

      <section className="page-shell page-section">
        <p className="eyebrow">What you can do</p>
        <h2 className="section-title mt-2 max-w-xl">Four paths. No menu maze.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {journeys.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="card group flex items-start justify-between gap-6 bg-white/90 p-5 backdrop-blur-sm transition hover:border-brand/50 sm:p-6"
            >
              <span>
                <span className="block text-[1.05rem] font-semibold text-paper group-hover:text-brand">{item.title}</span>
                <span className="mt-2 block text-sm leading-6 text-muted">{item.description}</span>
              </span>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-black/[0.07] bg-white/70 backdrop-blur-sm">
        <div className="page-shell page-section">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-2 max-w-lg">Less portal. More guidance.</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item, index) => (
              <li key={item.title} className="border-t-2 border-brand pt-4">
                <p className="font-mono text-xs font-semibold text-brand">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-[1.05rem] font-semibold text-paper">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-shell page-section">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">If this just happened</p>
            <h2 className="section-title mt-2 max-w-lg">
              Know what to do in the next five minutes.
            </h2>
          </div>
          <Link to="/learn" className={buttonStyles('secondary', 'md')}>
            Open safety library
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {firstResponse.map((item) => (
            <div key={item.label} className="surface-soft bg-white/80 p-5 backdrop-blur-sm">
              <p className="eyebrow text-brand">{item.label}</p>
              <h3 className="mt-2 text-[1.05rem] font-semibold text-paper">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
