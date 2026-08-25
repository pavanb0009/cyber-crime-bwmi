import { ArrowUpRight, CodeXml, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.07] bg-[#07100f] pb-24 pt-12 sm:pb-12 lg:mt-28 lg:pt-16">
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr]">
          <div className="max-w-md">
            <BrandMark />
            <p className="mt-5 text-sm leading-6 text-muted">
              A citizen-first reimagining of cybercrime reporting, built as an independent hackathon prototype. No real complaint is filed and no government system is contacted.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/[0.06] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-signal">
              <ShieldCheck className="h-3.5 w-3.5" /> Synthetic data by design
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Citizen journeys</p>
            <div className="grid gap-3 text-sm font-semibold text-paper/[0.85]">
              <Link to="/report" className="hover:text-signal">Report an incident</Link>
              <Link to="/check" className="hover:text-signal">Check a suspect</Link>
              <Link to="/track" className="hover:text-signal">Track a complaint</Link>
              <Link to="/learn" className="hover:text-signal">Safety library</Link>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Important</p>
            <div className="grid gap-3 text-sm text-muted">
              <a href="tel:1930" className="inline-flex items-center gap-1.5 font-semibold text-coral hover:text-[#ff9d95]">
                Call 1930 for financial fraud <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-paper"
              >
                Open the official portal <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <span>For immediate physical danger, contact local emergency services.</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.07] pt-6 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Rakshak / 1930 prototype</span>
          <span className="inline-flex items-center gap-2">
            Built with React + Tailwind
            <CodeXml className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </footer>
  )
}
