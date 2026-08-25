import { Link } from 'react-router-dom'

export function BrandGlyph({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="38" height="38" rx="12" fill="#C7FF67" />
      <path d="M14 11H10V17" stroke="#07100F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M26 11H30V17" stroke="#07100F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 29H10V23" stroke="#07100F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M26 29H30V23" stroke="#07100F" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M20 13.5L25.5 16.5V22.6C25.5 25.4 23.2 27.8 20 29C16.8 27.8 14.5 25.4 14.5 22.6V16.5L20 13.5Z"
        fill="#07100F"
      />
      <circle cx="20" cy="21" r="2.2" fill="#C7FF67" />
    </svg>
  )
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="Rakshak 1930 home">
      <BrandGlyph />
      {!compact ? (
        <span className="leading-none">
          <span className="block text-[0.93rem] font-extrabold tracking-[-0.03em] text-paper">
            RAKSHAK<span className="text-signal">/1930</span>
          </span>
          <span className="mt-1 block font-mono text-[0.53rem] uppercase tracking-[0.18em] text-muted">
            Citizen cyber help
          </span>
        </span>
      ) : null}
    </Link>
  )
}
