import { useMemo, useState } from 'react'
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
    <div className="border-t border-black/[0.08] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
      <p className="text-sm text-muted">Start here</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-paper">What happened?</h2>

      <div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {triageOptions.map((option) => {
          const active = option.id === selected
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={cx(
                'flex w-full items-center justify-between py-3.5 text-left text-[0.95rem] transition',
                active ? 'font-medium text-paper' : 'text-muted hover:text-paper',
              )}
            >
              {option.label}
              {active ? <span className="text-xs font-medium text-signal">Selected</span> : null}
            </button>
          )
        })}
      </div>

      <div className={cx('mt-6', current.urgent && 'text-coral')}>
        <p className="text-[0.95rem] font-medium text-paper">{current.title}</p>
        <p className="mt-1.5 text-sm leading-6 text-muted">{current.detail}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(current.route)}
        className={cx(buttonStyles('primary', 'lg'), 'mt-6 w-full sm:w-auto')}
      >
        {current.cta}
      </button>
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

export function HomePage() {
  return (
    <>
      <section className="page-shell pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div>
            <p className="text-sm text-muted">Citizen cyber help</p>
            <h1 className="mt-3 max-w-[14ch] text-[clamp(2.4rem,5vw,3.75rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-paper">
              Help should move faster than the scam.
            </h1>
            <p className="mt-6 max-w-md text-[1.05rem] leading-7 text-muted">
              A calmer path from “something happened” to the right action — report an incident, check a suspicious identifier, or understand what happens next.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      <section className="border-y border-black/[0.06]">
        <div className="page-shell flex flex-col gap-3 py-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-[0.95rem] text-paper">
            Money already left your account? Call <a href="tel:1930" className="font-medium text-coral hover:text-[#be123c]">1930</a> first, then continue online.
          </p>
          <a href="tel:1930" className="text-sm font-medium text-coral hover:text-[#be123c]">
            Call now
          </a>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24">
        <p className="text-sm text-muted">What you can do</p>
        <h2 className="mt-2 max-w-xl text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold tracking-[-0.03em] text-paper">
          Four paths. No menu maze.
        </h2>
        <div className="mt-10 divide-y divide-black/[0.08] border-y border-black/[0.08]">
          {journeys.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group grid gap-2 py-6 sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-baseline sm:gap-8"
            >
              <h3 className="text-[1.05rem] font-medium text-paper">{item.title}</h3>
              <p className="text-sm leading-6 text-muted">{item.description}</p>
              <span className="text-sm text-signal group-hover:underline">Open</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-mist">
        <div className="page-shell py-20 sm:py-24">
          <p className="text-sm text-muted">How it works</p>
          <h2 className="mt-2 max-w-lg text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold tracking-[-0.03em] text-paper">
            Less portal. More guidance.
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2">
            {principles.map((item, index) => (
              <li key={item.title}>
                <p className="text-sm text-muted">{index + 1}</p>
                <h3 className="mt-2 text-[1.15rem] font-medium text-paper">{item.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted">If this just happened</p>
            <h2 className="mt-2 max-w-lg text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold tracking-[-0.03em] text-paper">
              Know what to do in the next five minutes.
            </h2>
          </div>
          <Link to="/learn" className={buttonStyles('secondary', 'md')}>
            Open safety library
          </Link>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {[
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
          ].map((item) => (
            <div key={item.label}>
              <p className="text-sm text-muted">{item.label}</p>
              <h3 className="mt-2 text-[1.15rem] font-medium text-paper">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
