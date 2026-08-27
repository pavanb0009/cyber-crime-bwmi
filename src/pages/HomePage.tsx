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
  UserRoundX,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { buttonStyles } from '../components/Button'
import { cx } from '../lib/cx'

const heroCardMeta = [
  { src: '/cards/women_children.png', icon: ShieldCheck, key: 'women', to: '/report?type=women-child&anonymous=1', offset: 'md:mt-8', visibility: '' },
  { src: '/cards/financial_fraud.png', icon: BadgeIndianRupee, key: 'financial', to: 'tel:1930', offset: 'md:mt-4', visibility: '' },
  { src: '/cards/hacked_account.png', icon: UserRoundX, key: 'account', to: '/report?type=account', offset: '', visibility: '' },
  { src: '/cards/suspicious_number.png', icon: Search, key: 'check', to: '/check', offset: 'md:mt-4', visibility: '' },
  { src: '/cards/your_complaint.png', icon: FileSearch, key: 'track', to: '/track', offset: 'md:mt-8', visibility: 'hidden md:block' },
] as const

const learningMeta = [
  { href: '/learn', icon: BookOpen, key: 'manual', iconClass: 'bg-[#eaf2fd] text-brand' },
  { href: '/learn#safety', icon: ShieldCheck, key: 'safety', iconClass: 'bg-[#e8f7ee] text-[#1f8a4c]' },
  { href: '/learn#awareness', icon: Monitor, key: 'awareness', iconClass: 'bg-[#eef1f7] text-[#2b4c7e]' },
  { href: '/learn#digest', icon: FileText, key: 'digest', iconClass: 'bg-[#fdf3e4] text-[#b45309]' },
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
  const { t } = useTranslation(['pages', 'common'])

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
            {t('home.badge')}
          </p>

          <h1 className="mt-3.5 max-w-[22ch] text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.06] tracking-[-0.04em] text-paper">
            {t('home.title')}
          </h1>

          <p className="mt-2.5 max-w-lg text-[0.95rem] leading-6 text-muted">
            {t('home.subtitle')}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <Link to="/report" className={cx(buttonStyles('primary', 'md'), 'rounded-full px-6')}>
              {t('actions.startReport', { ns: 'common' })}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="tel:1930" className={cx(buttonStyles('secondary', 'md'), 'rounded-full px-6')}>
              {t('actions.call1930', { ns: 'common' })}
            </a>
          </div>
        </div>

        <div className="page-shell mt-8 sm:mt-10">
          <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-5">
            {heroCardMeta.map((card) => (
              <HeroCard
                key={card.src}
                src={card.src}
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

      <section className="relative isolate overflow-hidden border-t border-black/[0.05] bg-gradient-to-b from-white via-[#f6f8fc] to-white py-14 sm:py-16">
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
                  className="group flex flex-col rounded-[1.5rem] border border-black/[0.06] bg-white p-5 shadow-[0_14px_34px_rgba(16,16,18,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(16,16,18,0.12)] sm:p-6"
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
