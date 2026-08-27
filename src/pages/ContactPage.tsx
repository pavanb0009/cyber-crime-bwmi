import { PageIntro } from '../components/PageIntro'
import { cx } from '../lib/cx'
import { useTranslation } from 'react-i18next'

export function ContactPage() {
  const { t } = useTranslation('pages')
  const channels = [
    {
      label: t('contact.financial'),
      value: '1930',
      href: 'tel:1930',
      note: t('contact.financialNote'),
      urgent: true,
    },
    {
      label: t('contact.child'),
      value: '1098',
      href: 'tel:1098',
      note: t('contact.childNote'),
      urgent: true,
    },
    {
      label: t('contact.portal'),
      value: 'cybercrime.gov.in',
      href: 'https://cybercrime.gov.in/',
      note: t('contact.portalNote'),
      urgent: false,
    },
  ]

  return (
    <>
      <PageIntro
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        description={t('contact.description')}
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
      </section>
    </>
  )
}
