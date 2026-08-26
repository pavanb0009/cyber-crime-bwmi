import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  FilePlus2,
  House,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'

const navLinks: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/', label: 'Home', icon: House },
  { to: '/report', label: 'Register a Complaint', icon: FilePlus2 },
  { to: '/track', label: 'Track your Complaint', icon: Search },
  { to: '/check', label: 'Report & Check Suspect', icon: ShieldCheck },
  { to: '/volunteers', label: 'Cyber Volunteers', icon: Users },
  { to: '/learn', label: 'Learning Corner', icon: BookOpen },
  { to: '/contact', label: 'Contact Us', icon: Phone },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const currentLabel =
    navLinks.find((link) => link.to === location.pathname)?.label ?? 'Menu'

  return (
    <header className="page-shell pt-3 sm:pt-4">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] bg-mist px-4 py-1.5 text-[0.72rem] text-muted">
          <p className="truncate">
            भारत सरकार · Government of India
            <span aria-hidden className="px-2 text-black/20">|</span>
            गृह मंत्रालय · Ministry of Home Affairs
          </p>
          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <AccessibilityMenu />
            <a href="tel:1930" className="font-semibold text-alert hover:text-alertDark">
              Call 1930
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-5 sm:px-6 sm:py-4">
          <img
            src="/emblem-dark.png"
            alt="State Emblem of India"
            className="h-10 w-auto shrink-0 sm:h-12"
          />
          <span aria-hidden className="h-9 w-px shrink-0 bg-black/10 sm:h-11" />
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 sm:gap-4"
            aria-label="National Cyber Crime Reporting Portal home"
          >
            <img
              src="/i4c-mark.png"
              alt="Indian Cyber Crime Coordination Centre"
              className="h-8 w-auto shrink-0 sm:h-10"
            />
            <span className="min-w-0">
              <span className="block truncate text-[0.95rem] font-bold leading-tight text-paper sm:text-[1.2rem]">
                राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल
              </span>
              <span className="mt-0.5 block truncate text-[0.75rem] leading-tight text-muted sm:text-[0.95rem]">
                National Cyber Crime Reporting Portal
              </span>
            </span>
          </Link>
        </div>

        <div className="border-t border-black/[0.07]">
          <nav
            className="hidden overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden"
            aria-label="Primary navigation"
          >
            <div className="flex min-w-max items-center px-2 xl:min-w-0 xl:justify-between xl:px-3">
              {navLinks.map((link, index) => (
                <div key={link.to} className="flex shrink-0 items-center">
                  {index > 0 ? <span aria-hidden className="h-5 w-px bg-black/10" /> : null}
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'relative flex items-center gap-2 whitespace-nowrap px-3 py-3.5 text-[0.8rem] transition',
                        isActive
                          ? 'font-semibold text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-brand'
                          : 'text-paper/80 hover:text-brand',
                      )
                    }
                  >
                    <link.icon className="h-4 w-4 shrink-0" aria-hidden />
                    {link.label}
                  </NavLink>
                </div>
              ))}
            </div>
          </nav>

          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-paper md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            {currentLabel}
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <AnimatePresence>
            {mobileOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-black/[0.07] md:hidden"
              >
                <nav className="grid px-4 py-2" aria-label="Mobile navigation">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        cx(
                          'flex items-center gap-3 py-3 text-sm',
                          isActive ? 'font-semibold text-brand' : 'text-paper/80',
                        )
                      }
                    >
                      <link.icon className="h-4 w-4 shrink-0" aria-hidden />
                      {link.label}
                    </NavLink>
                  ))}
                  <div className="flex items-center justify-between border-t border-black/[0.07] py-3">
                    <AccessibilityMenu />
                    <a href="tel:1930" className="text-sm font-semibold text-alert">
                      Call 1930
                    </a>
                  </div>
                </nav>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
