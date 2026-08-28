import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'
import { BrandMark } from './BrandMark'
import { LanguageMenu } from './LanguageMenu'
import { ThemeToggle } from './ThemeToggle'

const navKeys = [
  { to: '/', key: 'nav.home' },
  { to: '/report', key: 'nav.report' },
  { to: '/track', key: 'nav.track' },
  { to: '/check', key: 'nav.check' },
  { to: '/call-scanner', key: 'nav.callScan' },
  { to: '/notice-verifier', key: 'nav.noticeVerifier' },
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
    <header className="sticky top-0 z-40 border-b border-black/[0.08] bg-card/70 backdrop-blur-2xl backdrop-saturate-150 dark:bg-canvas/90 dark:backdrop-saturate-100">
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
                  'relative pb-0.5 text-[0.9rem] transition',
                  isActive
                    ? 'font-bold text-paper after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-brand'
                    : 'font-medium text-muted hover:text-paper',
                )
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <LanguageMenu />
          <ThemeToggle />
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
            className="overflow-hidden border-t border-black/[0.06] bg-card lg:hidden"
          >
            <nav className="page-shell grid py-2" aria-label="Mobile navigation">
              {navKeys.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cx(
                      'py-3 text-sm',
                      isActive ? 'font-bold text-paper' : 'font-medium text-muted',
                    )
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
