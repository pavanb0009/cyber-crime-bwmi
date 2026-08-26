import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      })
      return () => window.cancelAnimationFrame(frame)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname, location.hash])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      <SiteHeader />
      <div className="top-glow" aria-hidden />
      <main>
        <Outlet />
      </main>
      <Footer />

      <a
        href="tel:1930"
        className="fixed inset-x-4 bottom-4 z-40 flex h-12 items-center justify-center rounded-xl bg-alert text-sm font-semibold text-ink shadow-soft sm:hidden"
      >
        Financial fraud? Call 1930
      </a>
    </div>
  )
}
