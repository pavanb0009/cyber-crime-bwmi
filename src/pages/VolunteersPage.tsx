import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageIntro } from '../components/PageIntro'
import { buttonStyles } from '../components/Button'
import { cx } from '../lib/cx'

export function VolunteersPage() {
  const { t } = useTranslation('pages')
  const roles = [
    { title: t('volunteers.r1'), description: t('volunteers.r1d') },
    { title: t('volunteers.r2'), description: t('volunteers.r2d') },
    { title: t('volunteers.r3'), description: t('volunteers.r3d') },
  ]

  return (
    <>
      <PageIntro
        eyebrow={t('volunteers.eyebrow')}
        title={t('volunteers.title')}
        description={t('volunteers.description')}
      />

      <section className="page-shell page-section pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map((role) => (
            <div key={role.title} className="card border-t-2 border-t-brand p-5 sm:p-6">
              <p className="text-[1.05rem] font-semibold text-paper">{role.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{role.description}</p>
            </div>
          ))}
        </div>

        <div className="surface-soft mt-4 p-5 sm:p-7">
          <p className="eyebrow">{t('volunteers.before')}</p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-paper">
            <li>{t('volunteers.b1')}</li>
            <li>{t('volunteers.b2')}</li>
            <li>{t('volunteers.b3')}</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/learn" className={cx(buttonStyles('primary', 'lg'))}>
              {t('volunteers.safetyLibrary')}
            </Link>
            <Link to="/contact" className={cx(buttonStyles('secondary', 'lg'))}>
              {t('volunteers.contactTeam')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
