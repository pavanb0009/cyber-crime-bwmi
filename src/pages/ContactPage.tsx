import { PageIntro } from '../components/PageIntro'

const channels = [
  {
    label: 'Financial fraud helpline',
    value: '1930',
    href: 'tel:1930',
    note: 'Call immediately if money has left your account. Every minute matters.',
  },
  {
    label: 'Women and child safety helpline',
    value: '1098',
    href: 'tel:1098',
    note: 'For urgent concerns involving a child.',
  },
  {
    label: 'Official cybercrime portal',
    value: 'cybercrime.gov.in',
    href: 'https://cybercrime.gov.in/',
    note: 'File a real complaint on the government portal.',
  },
]

export function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact us"
        title={<>Where to reach<br /><span className="text-signal">a real human.</span></>}
        description="This prototype cannot receive messages or file complaints. Use the official channels below when you need actual help."
      />

      <section className="page-shell">
        <div className="grid gap-4 sm:grid-cols-3">
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
              className="surface rounded-2xl p-6 transition hover:border-black/20"
            >
              <p className="text-sm text-muted">{channel.label}</p>
              <p className="mt-2 text-xl font-semibold text-paper">{channel.value}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{channel.note}</p>
            </a>
          ))}
        </div>

        <div className="surface mt-6 rounded-2xl p-6 sm:p-8">
          <p className="text-base font-semibold text-paper">About this prototype</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Every page here is an independent design exploration of cybercrime reporting. No government
            system is contacted, all suspect data is synthetic, and any complaint you create stays inside
            this browser.
          </p>
        </div>
      </section>
    </>
  )
}
