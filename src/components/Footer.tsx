import { Link } from 'react-router-dom'

const journeys = [
  { to: '/report', label: 'Register a complaint' },
  { to: '/check', label: 'Report & check suspect' },
  { to: '/track', label: 'Track your complaint' },
  { to: '/learn', label: 'Learning corner' },
]

const about = [
  { to: '/volunteers', label: 'Cyber volunteers' },
  { to: '/contact', label: 'Contact us' },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/[0.07] bg-mist pb-24 pt-12 sm:pb-12">
      <div className="page-shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img src="/emblem-dark.png" alt="" className="h-9 w-auto" />
              <img src="/i4c-mark.png" alt="" className="h-6 w-auto" />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              A citizen-first reimagining of cybercrime reporting. No real complaint is filed and no
              government system is contacted.
            </p>
          </div>

          <div>
            <p className="eyebrow">Journeys</p>
            <div className="mt-4 grid gap-2.5 text-sm text-paper">
              {journeys.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-brand">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">About</p>
            <div className="mt-4 grid gap-2.5 text-sm text-paper">
              {about.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-brand">
                  {item.label}
                </Link>
              ))}
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand"
              >
                Official cybercrime portal
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow">If you need help now</p>
            <div className="mt-4 grid gap-2.5 text-sm">
              <a href="tel:1930" className="font-semibold text-alert hover:text-alertDark">
                Call 1930 for financial fraud
              </a>
              <a href="tel:1098" className="text-paper hover:text-brand">
                Call 1098 for child safety
              </a>
              <p className="leading-6 text-muted">
                For immediate physical danger, contact local emergency services.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-black/[0.07] pt-6 text-sm text-muted">
          © 2026 Independent prototype · synthetic data by design
        </p>
      </div>
    </footer>
  )
}
