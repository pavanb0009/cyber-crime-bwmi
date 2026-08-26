import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { cx } from '../lib/cx'
import { AccessibilityMenu } from './AccessibilityMenu'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Register a Complaint' },
  { to: '/track', label: 'Track your Complaint' },
  { to: '/check', label: 'Report & Check Suspect' },
  { to: '/volunteers', label: 'Cyber Volunteers' },
  { to: '/learn', label: 'Learning Corner' },
  { to: '/contact', label: 'Contact Us' },
]

function IndianFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={className} role="img" aria-label="Flag of India">
      <rect width="36" height="8" fill="#ff9933" />
      <rect y="8" width="36" height="8" fill="#ffffff" />
      <rect y="16" width="36" height="8" fill="#138808" />
      <g stroke="#000080" strokeWidth="0.6" fill="none">
        <circle cx="18" cy="12" r="3.1" />
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index * Math.PI) / 6
          return (
            <line
              key={index}
              x1={18 + Math.cos(angle) * 0.6}
              y1={12 + Math.sin(angle) * 0.6}
              x2={18 + Math.cos(angle) * 3.1}
              y2={12 + Math.sin(angle) * 3.1}
            />
          )
        })}
      </g>
      <rect width="36" height="24" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
    </svg>
  )
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="bg-white">
      <div className="border-b border-black/[0.07] bg-[#f8f8f8]">
        <div className="page-shell flex min-h-11 items-center justify-between gap-4 py-2 text-[0.8rem] text-[#4b4b52]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <IndianFlag className="h-[1.05rem] w-[1.6rem] shrink-0" />
            <span>भारत सरकार</span>
            <span aria-hidden className="text-black/20">|</span>
            <span>Government of India</span>
            <span aria-hidden className="hidden pl-1 text-black/20 sm:inline">|</span>
            <span className="hidden sm:inline">गृह मंत्रालय</span>
            <span aria-hidden className="hidden text-black/20 sm:inline">|</span>
            <span className="hidden sm:inline">Ministry of Home Affairs</span>
          </div>

          <div className="flex items-center gap-4">
            <AccessibilityMenu />
            <a
              href="tel:1930"
              className="hidden font-medium text-coral hover:text-[#be123c] sm:inline"
              aria-label="Call national cybercrime helpline 1930"
            >
              Call 1930
            </a>
            <img
              src="/emblem-dark.png"
              alt="State Emblem of India"
              className="h-6 w-auto shrink-0 opacity-90"
            />
          </div>
        </div>
      </div>

      <div className="page-shell flex items-center gap-4 py-5 sm:gap-6 sm:py-6">
        <img
          src="/emblem-dark.png"
          alt="State Emblem of India"
          className="h-12 w-auto shrink-0 sm:h-[4.5rem]"
        />
        <span aria-hidden className="h-10 w-px shrink-0 bg-black/10 sm:h-[4.4rem]" />
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 sm:gap-5"
          aria-label="National Cyber Crime Reporting Portal home"
        >
          <img
            src="/i4c-mark.png"
            alt="Indian Cyber Crime Coordination Centre"
            className="h-8 w-auto shrink-0 sm:h-[3.25rem]"
          />
          <span className="min-w-0">
            <span className="block truncate text-[0.85rem] font-semibold leading-tight text-[#232323] sm:text-[1.2rem]">
              राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल
            </span>
            <span className="mt-0.5 block truncate text-[1rem] font-bold leading-tight tracking-[-0.01em] text-[#2a2f45] sm:mt-1 sm:text-[1.55rem]">
              National Cyber Crime Reporting Portal
            </span>
          </span>
        </Link>
      </div>

      <div className="page-shell pb-4">
        <div className="rounded-2xl border border-black/[0.04] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.10)]">
          <nav className="hidden items-center px-5 lg:flex" aria-label="Primary navigation">
            {navLinks.map((link, index) => (
              <div key={link.to} className="flex items-center">
                {index > 0 ? <span aria-hidden className="h-5 w-px bg-black/10" /> : null}
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cx(
                      'relative whitespace-nowrap px-[0.95rem] py-4 text-[0.845rem] transition',
                      isActive
                        ? 'font-medium text-[#1668cf] after:absolute after:inset-x-[0.95rem] after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[#1668cf]'
                        : 'text-[#3b3b45] hover:text-[#1668cf]',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </div>
            ))}
          </nav>

          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm font-medium text-[#3b3b45] lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            {navLinks.find((link) => link.to === location.pathname)?.label ?? 'Menu'}
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <AnimatePresence>
            {mobileOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-black/[0.06] lg:hidden"
              >
                <nav className="grid px-5 py-2" aria-label="Mobile navigation">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        cx(
                          'py-3 text-sm',
                          isActive ? 'font-medium text-[#1668cf]' : 'text-[#3b3b45]',
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
        </div>
      </div>
    </header>
  )
}
