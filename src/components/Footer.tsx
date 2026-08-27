import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { brand } from '../data/brand'
import { BrandMark } from './BrandMark'

export function Footer() {
  const { t } = useTranslation(['pages', 'common'])
  const year = new Date().getFullYear()

  const journeys = [
    { to: '/report', label: t('footer.register') },
    { to: '/check', label: t('footer.checkSuspect') },
    { to: '/track', label: t('footer.trackComplaint') },
    { to: '/learn', label: t('footer.learningCorner') },
  ]

  const about = [
    { to: '/volunteers', label: t('footer.volunteers') },
    { to: '/contact', label: t('footer.contact') },
  ]

  return (
    <footer className="mt-16 border-t border-black/[0.07] bg-white/80 pb-24 pt-12 backdrop-blur-sm sm:pb-12">
      <div className="page-shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm">
            <BrandMark />
            <p className="mt-4 text-sm leading-6 text-muted">{t('footer.about')}</p>
          </div>

          <div>
            <p className="eyebrow">{t('footer.journeys')}</p>
            <div className="mt-4 grid gap-2.5 text-sm text-paper">
              {journeys.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-brand">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{t('footer.aboutLabel')}</p>
            <div className="mt-4 grid gap-2.5 text-sm text-paper">
              {about.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-brand">
                  {item.label}
                </Link>
              ))}
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand"
              >
                {t('footer.officialPortal')}
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow">{t('footer.helpNow')}</p>
            <div className="mt-4 grid gap-2.5 text-sm">
              <a href="tel:1930" className="font-semibold text-alert hover:text-alertDark">
                {t('footer.callFinancial')}
              </a>
              <a href="tel:1098" className="text-paper hover:text-brand">
                {t('footer.callChild')}
              </a>
              <p className="leading-6 text-muted">{t('helpline.emergency', { ns: 'common' })}</p>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-black/[0.07] pt-6 text-sm text-muted">
          {t('footer.copyright', {
            year,
            name: brand.name,
            disclaimer: t('prototype.disclaimer', { ns: 'common' }),
            synthetic: t('prototype.synthetic', { ns: 'common' }),
          })}
        </p>
      </div>
    </footer>
  )
}
