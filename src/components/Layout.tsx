import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PhoneCall } from 'lucide-react'
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
        className="fixed inset-x-3 bottom-3 z-40 flex h-14 items-center justify-center gap-2 rounded-2xl border border-coral/40 bg-coral text-sm font-extrabold text-ink shadow-[0_18px_60px_rgba(0,0,0,.45)] sm:hidden"
      >
        <PhoneCall className="h-4 w-4" /> Financial fraud? Call 1930
      </a>
    </div>
  )
}
