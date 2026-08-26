import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { PrototypeBar } from './PrototypeBar'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      {/* <PrototypeBar /> */}
      <SiteHeader />
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
