import { Link } from 'react-router-dom'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-baseline gap-2" aria-label="Rakshak 1930 home">
      <span className="text-[1.15rem] font-semibold tracking-[-0.04em] text-paper">rakshak</span>
      {!compact ? (
        <span className="text-[0.8rem] font-medium text-muted">1930</span>
      ) : null}
    </Link>
  )
}
