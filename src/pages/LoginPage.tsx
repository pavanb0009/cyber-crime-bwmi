import { useEffect, useState } from 'react'
import { Cloud, KeyRound, LogIn, UserPlus } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { useAuth } from '../context/AuthContext'
import { cx } from '../lib/cx'
import { useTranslation } from 'react-i18next'

type LoginMode = 'signin' | 'signup'

const DEMO_EMAIL = 'demo@cyberdesk.in'
const DEMO_PASSWORD = 'demo1234'

export function LoginPage() {
  const { t } = useTranslation('pages')
  const { configured, loading: authLoading, signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/track'
  const [mode, setMode] = useState<LoginMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (user) navigate(returnTo, { replace: true })
  }, [navigate, returnTo, user])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (password.length < 6) {
      setError(t('auth.passwordLength'))
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        navigate(returnTo, { replace: true })
      } else {
        const result = await signUp(email.trim(), password)
        if (result.confirmationRequired) {
          setNotice(t('auth.checkEmail'))
        } else {
          navigate(returnTo, { replace: true })
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('auth.genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageIntro title={t('auth.title')} />
      <section className="page-shell pb-14">
        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="card p-5 sm:p-7">
            <div className="flex rounded-xl bg-mist p-1">
              {(['signin', 'signup'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item)
                    setError('')
                    setNotice('')
                  }}
                  className={cx(
                    'h-10 flex-1 rounded-lg text-sm font-semibold transition',
                    mode === item ? 'bg-card text-paper shadow-soft' : 'text-muted hover:text-paper',
                  )}
                >
                  {item === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
                </button>
              ))}
            </div>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label className="field-label" htmlFor="login-email">{t('auth.email')}</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={cx('text-field', error && 'field-invalid')}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="login-password">{t('auth.password')}</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={cx('text-field', error && 'field-invalid')}
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </div>

              {error ? <p className="text-sm font-semibold text-alert">{error}</p> : null}
              {notice ? <p className="rounded-xl border border-brand/25 bg-brand/[0.06] p-3 text-sm text-paper">{notice}</p> : null}
              {!configured ? (
                <p className="rounded-xl border border-alert/25 bg-alert/[0.05] p-3 text-sm leading-6 text-alert">
                  {t('auth.notConfigured')}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" loading={submitting || authLoading} disabled={!configured}>
                {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {mode === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-dashed border-brand/25 bg-brand/[0.04] p-4">
              <div className="flex items-start gap-2.5">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-paper">{t('auth.demoTitle')}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{t('auth.demoHelp')}</p>
                  <dl className="mt-3 grid gap-2 font-mono text-[0.8rem] sm:grid-cols-2">
                    <div>
                      <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">{t('auth.email')}</dt>
                      <dd className="mt-0.5 break-all text-paper">{DEMO_EMAIL}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">{t('auth.password')}</dt>
                      <dd className="mt-0.5 text-paper">{DEMO_PASSWORD}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setEmail(DEMO_EMAIL)
                      setPassword(DEMO_PASSWORD)
                      setError('')
                      setNotice('')
                    }}
                    className={cx(buttonStyles('secondary', 'sm'), 'mt-3 rounded-full')}
                  >
                    {t('auth.demoFill')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="surface-soft p-5 sm:p-6">
            <Cloud className="h-6 w-6 text-brand" />
            <h2 className="mt-4 text-lg font-semibold text-paper">{t('auth.whyTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{t('auth.whyBody')}</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-paper">
              <li>{t('auth.benefitReports')}</li>
              <li>{t('auth.benefitPrivate')}</li>
              <li>{t('auth.benefitGuest')}</li>
            </ul>
            <Link to="/" className={cx(buttonStyles('secondary', 'md'), 'mt-6 w-full')}>
              {t('auth.continueGuest')}
            </Link>
          </aside>
        </div>
      </section>
    </>
  )
}
