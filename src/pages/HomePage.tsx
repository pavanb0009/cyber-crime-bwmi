import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { cx } from '../lib/cx'

const triageOptions = [
  {
    id: 'financial',
    label: 'Money left my account',
    title: 'Call 1930 before filing online.',
    detail: 'Then gather the transaction ID, amount, time and receiving account or UPI handle.',
    cta: 'Start financial report',
    route: '/report?type=financial',
    urgent: true,
  },
  {
    id: 'account',
    label: 'Someone took my account',
    title: 'Secure access from a trusted device.',
    detail: 'Change the password, sign out other sessions and preserve login alerts before reporting.',
    cta: 'Report account misuse',
    route: '/report?type=account',
    urgent: false,
  },
  {
    id: 'harassment',
    label: 'I am being threatened',
    title: 'Preserve the conversation first.',
    detail: 'Save screenshots, profile links and timestamps. Block after evidence is safely captured.',
    cta: 'Start a sensitive report',
    route: '/report?type=harassment',
    urgent: false,
  },
  {
    id: 'check',
    label: 'Check a number or link',
    title: 'Pause before you pay or reply.',
    detail: 'Search a phone number, UPI ID, email or website in the synthetic demo repository.',
    cta: 'Open suspect checker',
    route: '/check',
    urgent: false,
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
    <div className="card p-5 sm:p-6">
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
                  : 'border-black/[0.10] text-paper hover:border-brand/40 hover:bg-mist',
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
        </button>
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
      <section className="page-shell pb-12 pt-10 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start lg:gap-14">
          <div>
            <p className="eyebrow">Citizen cyber help</p>
            <h1 className="mt-3 max-w-[16ch] text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.14] tracking-[-0.03em] text-paper">
              Help should move faster than the scam.
            </h1>
            <p className="mt-5 max-w-md text-[0.95rem] leading-7 text-muted">
              A calmer path from “something happened” to the right action — report an incident, check a
              suspicious identifier, or understand what happens next.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/report" className={buttonStyles('primary', 'lg')}>
                Start a report
              </Link>
              <Link to="/check" className={buttonStyles('secondary', 'lg')}>
                Check a number
              </Link>
            </div>
          </div>
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
              className="card group flex items-start justify-between gap-6 p-5 transition hover:border-brand/50 sm:p-6"
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

      <section className="border-y border-black/[0.07] bg-mist">
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
            <div key={item.label} className="surface-soft p-5">
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
