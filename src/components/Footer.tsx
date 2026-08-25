import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/[0.06] pb-24 pt-12 sm:pb-12 lg:mt-32">
      <div className="page-shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="max-w-sm">
            <BrandMark />
            <p className="mt-4 text-sm leading-6 text-muted">
              A citizen-first reimagining of cybercrime reporting. No real complaint is filed and no government system is contacted.
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Journeys</p>
            <div className="mt-3 grid gap-2 text-sm text-paper">
              <Link to="/report" className="hover:text-signal">Report an incident</Link>
              <Link to="/check" className="hover:text-signal">Check a suspect</Link>
              <Link to="/track" className="hover:text-signal">Track a complaint</Link>
              <Link to="/learn" className="hover:text-signal">Safety library</Link>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted">If you need help now</p>
            <div className="mt-3 grid gap-2 text-sm text-muted">
              <a href="tel:1930" className="font-medium text-coral hover:text-[#be123c]">
                Call 1930 for financial fraud
              </a>
              <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="hover:text-paper">
                Official cybercrime portal
              </a>
              <p>For immediate physical danger, contact local emergency services.</p>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-black/[0.06] pt-6 text-sm text-muted">
          © 2026 Rakshak prototype · synthetic data by design
        </p>
      </div>
    </footer>
  )
}
