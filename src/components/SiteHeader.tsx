import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'
import { BrandMark } from './BrandMark'
import { buttonStyles } from './Button'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report' },
  { to: '/track', label: 'Track' },
  { to: '/check', label: 'Check' },
  { to: '/volunteers', label: 'Volunteers' },
  { to: '/learn', label: 'Learn' },
  { to: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.04] bg-white/80 backdrop-blur-md">
      <div className="page-shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
        <BrandMark />

        <nav className="hidden items-center justify-center gap-7 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cx(
                  'text-[0.9rem] transition',
                  isActive ? 'font-medium text-paper' : 'text-muted hover:text-paper',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <span className="hidden sm:block">
            <AccessibilityMenu />
          </span>
          <Link to="/report" className={cx(buttonStyles('primary', 'sm'), 'hidden sm:inline-flex')}>
            Start a report
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center text-paper lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Open navigation"
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
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cx('py-3 text-sm', isActive ? 'font-medium text-paper' : 'text-muted')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex items-center justify-between border-t border-black/[0.07] py-3">
                <AccessibilityMenu />
                <Link to="/report" className={buttonStyles('primary', 'sm')}>
                  Start a report
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
