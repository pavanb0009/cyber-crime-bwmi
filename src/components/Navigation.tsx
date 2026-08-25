import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'
import { BrandMark } from './BrandMark'

const links = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report' },
  { to: '/check', label: 'Check' },
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
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <BrandMark />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cx(
                  'text-sm transition',
                  isActive ? 'font-medium text-paper' : 'text-muted hover:text-paper',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <AccessibilityMenu />
          <a
            href="tel:1930"
            className="hidden text-sm font-medium text-coral hover:text-[#be123c] sm:inline"
            aria-label="Call national cybercrime helpline 1930"
          >
            Call 1930
          </a>
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
            <nav className="page-shell grid py-3" aria-label="Mobile navigation">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cx(
                      'py-3 text-sm',
                      isActive ? 'font-medium text-paper' : 'text-muted',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <a href="tel:1930" className="py-3 text-sm font-medium text-coral">
                Call 1930
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
