import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, PhoneCall, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'
import { BrandMark } from './BrandMark'
import { buttonStyles } from './Button'

const links = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report' },
  { to: '/check', label: 'Check suspect' },
  { to: '/track', label: 'Track' },
  { to: '/learn', label: 'Learn' },
]

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink/[0.80] backdrop-blur-2xl">
      <div className="page-shell flex h-[4.65rem] items-center justify-between gap-4">
        <BrandMark />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cx(
                  'relative rounded-lg px-3.5 py-2 text-sm font-semibold transition',
                  isActive ? 'text-paper' : 'text-muted hover:bg-white/[0.04] hover:text-paper',
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[1.15rem] h-0.5 rounded-full bg-signal"
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AccessibilityMenu />
          <a
            href="tel:1930"
            className={cx(buttonStyles('danger', 'sm'), 'hidden sm:inline-flex')}
            aria-label="Call national cybercrime helpline 1930"
          >
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            Call 1930
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-paper transition hover:border-white/20 lg:hidden"
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
            className="overflow-hidden border-t border-white/[0.07] bg-[#091311] lg:hidden"
          >
            <nav className="page-shell grid gap-1 py-4" aria-label="Mobile navigation">
              {links.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cx(
                      'flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold',
                      isActive ? 'bg-signal text-ink' : 'text-paper hover:bg-white/[0.05]',
                    )
                  }
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[0.62rem] opacity-60">0{index + 1}</span>
                    {link.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </NavLink>
              ))}
              <a href="tel:1930" className={cx(buttonStyles('danger', 'lg'), 'mt-2 w-full')}>
                <PhoneCall className="h-4 w-4" /> Call cybercrime helpline 1930
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
