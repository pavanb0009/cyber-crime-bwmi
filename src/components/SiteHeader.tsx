import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'
import { BrandMark } from './BrandMark'
import { LanguageMenu } from './LanguageMenu'

const navKeys = [
  { to: '/', key: 'nav.home' },
  { to: '/report', key: 'nav.report' },
  { to: '/track', key: 'nav.track' },
  { to: '/check', key: 'nav.check' },
  { to: '/call-scanner', key: 'nav.callScan' },
  { to: '/volunteers', key: 'nav.volunteers' },
  { to: '/learn', key: 'nav.learn' },
  { to: '/contact', key: 'nav.contact' },
] as const

export function SiteHeader() {
  const { t } = useTranslation('common')
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/45 backdrop-blur-2xl backdrop-saturate-150">
      <div className="page-shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <BrandMark />

        <nav className="hidden items-center justify-center gap-6 xl:gap-7 lg:flex" aria-label="Primary navigation">
          {navKeys.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cx(
                  'text-[0.9rem] text-black transition hover:opacity-70',
                  isActive ? 'font-semibold' : 'font-medium',
                )
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <LanguageMenu />
          <AccessibilityMenu />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center text-black lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={t('nav.openNavigation')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-black/[0.06] bg-white lg:hidden"
          >
            <nav className="page-shell grid py-2" aria-label="Mobile navigation">
              {navKeys.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cx('py-3 text-sm text-black', isActive ? 'font-semibold' : 'font-medium')
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
