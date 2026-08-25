import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { PrototypeBar } from './PrototypeBar'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <PrototypeBar />
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />

      <a
        href="tel:1930"
        className="fixed inset-x-4 bottom-4 z-40 flex h-12 items-center justify-center rounded-lg bg-coral text-sm font-medium text-ink sm:hidden"
      >
        Financial fraud? Call 1930
      </a>
    </div>
  )
}
