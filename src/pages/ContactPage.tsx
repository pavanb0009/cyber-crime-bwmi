import { PageIntro } from '../components/PageIntro'
import { cx } from '../lib/cx'

const channels = [
  {
    label: 'Financial fraud helpline',
    value: '1930',
    href: 'tel:1930',
    note: 'Call immediately if money has left your account. Every minute matters.',
    urgent: true,
  },
  {
    label: 'Women and child safety helpline',
    value: '1098',
    href: 'tel:1098',
    note: 'For urgent concerns involving a child.',
    urgent: true,
  },
  {
    label: 'Official cybercrime portal',
    value: 'cybercrime.gov.in',
    href: 'https://cybercrime.gov.in/',
    note: 'File a real complaint on the government portal.',
    urgent: false,
  },
]

export function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact us"
        title="Where to reach a real human."
        description="This prototype cannot receive messages or file complaints. Use the official channels below when you need actual help."
        aside="Helplines are staffed by the respective official services, not by this prototype."
      />

      <section className="page-shell page-section pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
              className="card group p-5 transition hover:border-brand/50 sm:p-6"
            >
              <p className="eyebrow text-brand">{channel.label}</p>
              <p className={cx('mt-2 text-xl font-semibold', channel.urgent ? 'text-alert' : 'text-paper')}>
                {channel.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{channel.note}</p>
            </a>
          ))}
        </div>

        <div className="surface-soft mt-4 p-5 sm:p-7">
          <p className="text-base font-semibold text-paper">About this prototype</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Every page here is an independent design exploration of cybercrime reporting. No government
            system is contacted, all suspect data is synthetic, and any complaint you create stays inside
            this browser.
          </p>
        </div>
      </section>
    </>
  )
}
