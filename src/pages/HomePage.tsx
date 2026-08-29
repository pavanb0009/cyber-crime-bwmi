import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BadgeIndianRupee,
  BookOpen,
  FileSearch,
  FileText,
  ImagePlus,
  LoaderCircle,
  Mic,
  MicOff,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundX,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { cx } from '../lib/cx'
import { resolveCitizenIntent, type CitizenIntent } from '../lib/routeIntent'
import { useResolvedTheme } from '../lib/theme'
import { useVoiceTranscription } from '../lib/useVoiceTranscription'

const heroCardMeta = [
  {
    src: '/cards/women_children.png',
    srcDark: '/cyber_rakshak_card_art_transparent_white-dark/women_children-dark.png',
    icon: ShieldCheck,
    key: 'women',
    to: '/report?type=women-child&anonymous=1',
    offset: 'md:mt-8',
    visibility: '',
  },
  {
    src: '/cards/financial_fraud.png',
    srcDark: '/cyber_rakshak_card_art_transparent_white-dark/financial_fraud-dark.png',
    icon: BadgeIndianRupee,
    key: 'financial',
    to: 'tel:1930',
    offset: 'md:mt-4',
    visibility: '',
  },
  {
    src: '/cards/hacked_account.png',
    srcDark: '/cyber_rakshak_card_art_transparent_white-dark/hacked_account-dark.png',
    icon: UserRoundX,
    key: 'account',
    to: '/report?type=account',
    offset: '',
    visibility: '',
  },
  {
    src: '/cards/suspicious_number.png',
    srcDark: '/cyber_rakshak_card_art_transparent_white-dark/suspicious_number-dark.png',
    icon: Search,
    key: 'check',
    to: '/check',
    offset: 'md:mt-4',
    visibility: '',
  },
  {
    src: '/cards/your_complaint.png',
    srcDark: '/cyber_rakshak_card_art_transparent_white-dark/your_complaint-dark.png',
    icon: FileSearch,
    key: 'track',
    to: '/track',
    offset: 'md:mt-8',
    visibility: 'hidden md:block',
  },
] as const

const learningMeta = [
  { href: '/learn', icon: BookOpen, key: 'manual', iconClass: 'bg-[#eaf2fd] text-brand dark:bg-white/[0.06] dark:text-paper' },
  { href: '/learn#safety', icon: ShieldCheck, key: 'safety', iconClass: 'bg-[#e8f7ee] text-[#1f8a4c] dark:bg-white/[0.06] dark:text-paper' },
  { href: '/learn#awareness', icon: Monitor, key: 'awareness', iconClass: 'bg-[#eef1f7] text-[#2b4c7e] dark:bg-white/[0.06] dark:text-paper' },
  { href: '/learn#digest', icon: FileText, key: 'digest', iconClass: 'bg-[#fdf3e4] text-[#b45309] dark:bg-white/[0.06] dark:text-paper' },
] as const

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
    'group block w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft dark:hover:translate-y-0 dark:hover:shadow-none',
    offset,
    visibility,
  )

  const body = (
    <>
      <span className="relative block aspect-[6/7] w-full bg-card">
        <img
          key={src}
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
  const { t, i18n } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const theme = useResolvedTheme()
  const [copilotText, setCopilotText] = useState('')
  const [copilotResult, setCopilotResult] = useState<CitizenIntent | null>(null)
  const [copilotError, setCopilotError] = useState('')
  const voice = useVoiceTranscription({
    language: i18n.resolvedLanguage || 'en',
    onTranscript(transcript) {
      setCopilotText(transcript.slice(0, 700))
      setCopilotError('')
      setCopilotResult(resolveCitizenIntent(transcript))
    },
  })

  function runCopilot(nextText = copilotText) {
    if (nextText.trim().length < 12) {
      setCopilotResult(null)
      setCopilotError(t('home.copilot.tooShort'))
      return
    }
    setCopilotError('')
    setCopilotResult(resolveCitizenIntent(nextText))
  }

  function openCopilotRoute() {
    if (!copilotResult) return
    navigate(copilotResult.url)
  }

  return (
    <>
      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col justify-center py-8">
         <img
          src={theme === 'dark' ? '/hero3-dark.png' : '/hero3.png'}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center"
        /> 

        <div className="page-shell flex flex-col items-center text-center">
          <p className="inline-flex rounded-full bg-brand/[0.08] px-3 py-1 text-[0.75rem] font-medium text-brand">
            {t('home.badge')}
          </p>

          <h1 className="mt-3.5 max-w-[20ch] text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.06] tracking-[-0.04em] text-paper">
            {t('home.title')}
          </h1>

          <div className="mt-4 w-full max-w-2xl text-left">
            <p className="mb-1.5 flex items-center justify-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand">
              <Sparkles className="h-3 w-3" aria-hidden />
              {t('home.copilot.eyebrow')}
              {voice.listening ? (
                <span className="ml-1 flex items-end gap-[2px]" aria-hidden>
                  {[0, 150, 300, 75].map((delay) => (
                    <span
                      key={delay}
                      className="h-2.5 w-[2px] animate-pulse rounded-full bg-alert"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              ) : null}
            </p>

            <div
              className={cx(
                'relative flex items-center gap-1 rounded-full border bg-card/95 p-1 shadow-card backdrop-blur-xl dark:shadow-none',
                voice.listening ? 'border-alert/45' : 'border-black/[0.08]',
              )}
            >
              <button
                type="button"
                onClick={voice.toggle}
                disabled={voice.processing}
                aria-label={t('home.copilot.speak')}
                className={cx(
                  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[0.75rem] font-semibold transition disabled:opacity-60 sm:px-3',
                  voice.listening
                    ? 'bg-alert text-ink hover:bg-alertDark'
                    : 'bg-brand/[0.10] text-brand hover:bg-brand/[0.16]',
                )}
              >
                {voice.processing ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : voice.listening ? (
                  <MicOff className="h-3.5 w-3.5" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {voice.processing
                    ? t('home.copilot.processing')
                    : voice.listening
                      ? t('home.copilot.stopListening')
                      : t('home.copilot.speak')}
                </span>
              </button>

              <input
                type="text"
                value={copilotText}
                onChange={(event) => {
                  setCopilotText(event.target.value.slice(0, 700))
                  setCopilotResult(null)
                  setCopilotError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    runCopilot()
                  }
                }}
                className="hero-copilot-input h-8 min-w-0 flex-1 bg-transparent px-2 text-[0.8rem] leading-5 text-paper outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"
                placeholder={t('home.copilot.placeholder')}
              />

              <button
                type="button"
                onClick={() => runCopilot()}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-brand px-3 text-[0.75rem] font-semibold text-ink transition hover:bg-brandDark"
              >
                {t('home.copilot.understand')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {[
                t('home.copilot.sampleMoney'),
                t('home.copilot.sampleCall'),
                t('home.copilot.sampleNotice'),
                t('home.copilot.sampleNumber'),
              ].map((sample, index) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setCopilotText(sample)
                    runCopilot(sample)
                  }}
                  className={cx(
                    'rounded-full border border-black/[0.09] bg-card/70 px-2.5 py-1 text-[0.7rem] text-muted backdrop-blur transition hover:border-brand/50 hover:text-paper',
                    index > 1 && 'hidden sm:inline-flex',
                  )}
                >
                  {sample}
                </button>
              ))}
            </div>

            {copilotError || voice.error ? (
              <p className="mt-3 text-sm font-semibold text-alert">{copilotError || voice.error}</p>
            ) : null}

            {copilotResult ? (
              <div className="mt-2 flex flex-col gap-2 rounded-xl border border-brand/20 bg-card/95 px-3 py-2.5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.12em] text-brand">
                    {copilotResult.result.severity} · {copilotResult.destinationLabel}
                  </p>
                  <p className="mt-0.5 truncate text-[0.8rem] font-semibold text-paper">{copilotResult.result.label}</p>
                  {copilotResult.extracted ? (
                    <p className="mt-0.5 truncate font-mono text-[0.68rem] text-brand">
                      {t('home.copilot.found')}: {copilotResult.extracted.value}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={openCopilotRoute}
                  className={cx(
                    copilotResult.destination === 'emergency'
                      ? buttonStyles('danger', 'sm')
                      : buttonStyles('primary', 'sm'),
                    'h-8 shrink-0 rounded-full px-3.5',
                  )}
                >
                  {copilotResult.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/report?type=financial&mode=emergency"
              className={cx(buttonStyles('danger', 'sm'), 'rounded-full px-4')}
            >
              <Zap className="h-3.5 w-3.5" aria-hidden />
              {t('home.lostMoney')}
            </Link>
            <a href="tel:1930" className={cx(buttonStyles('secondary', 'sm'), 'rounded-full px-4')}>
              {t('actions.call1930', { ns: 'common' })}
            </a>
            <Link to="/report" className={cx(buttonStyles('primary', 'sm'), 'rounded-full px-4')}>
              {t('actions.startReport', { ns: 'common' })}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="page-shell mt-8 sm:mt-10">
          <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-5">
            {heroCardMeta.map((card) => (
              <HeroCard
                key={card.src}
                src={theme === 'dark' ? card.srcDark : card.src}
                icon={card.icon}
                label={t(`home.cards.${card.key}.label`)}
                action={t(`home.cards.${card.key}.action`)}
                to={card.to}
                offset={card.offset}
                visibility={card.visibility}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-black/[0.05] bg-canvas py-14 sm:py-16">
        <div className="page-shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-brand/[0.08] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-brand">
                {t('home.learning')}
              </p>
              <h2 className="mt-3 max-w-[26ch] text-[clamp(1.5rem,2.8vw,2.1rem)] font-bold leading-[1.12] tracking-[-0.035em] text-paper">
                {t('home.learningTitle')}
              </h2>
            </div>
            <Link
              to="/learn"
              className="group inline-flex shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-brand transition hover:text-brandDark"
            >
              {t('home.learningAll')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {learningMeta.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className="group flex flex-col rounded-[1.5rem] border border-black/[0.06] bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft dark:hover:translate-y-0 dark:hover:shadow-none sm:p-6"
                >
                  <span
                    className={cx(
                      'inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-inset ring-black/[0.04]',
                      item.iconClass,
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-paper">
                    {t(`home.learn.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-[0.875rem] leading-6 text-muted">
                    {t(`home.learn.${item.key}.description`)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand">
                    {t('actions.readMore', { ns: 'common' })}
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
