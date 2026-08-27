import { Link } from 'react-router-dom'
import { brand } from '../data/brand'
import { cx } from '../lib/cx'

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <path
        d="M16 2.4 18.1 13.9 29.6 16 18.1 18.1 16 29.6 13.9 18.1 2.4 16 13.9 13.9 16 2.4Z"
        className="fill-black"
      />
    </svg>
  )
}

export function BrandMark({
  showTagline = false,
  className,
}: {
  showTagline?: boolean
  className?: string
}) {
  return (
    <Link
      to="/"
      className={cx('flex min-w-0 items-center gap-2', className)}
      aria-label={`${brand.name} home`}
    >
      <BrandGlyph className="h-5 w-5 shrink-0 sm:h-[1.35rem] sm:w-[1.35rem]" />
      <span className="min-w-0">
        <span className="block truncate text-[1.05rem] font-bold leading-none tracking-[-0.04em] text-black">
          {brand.name}
        </span>
        {showTagline ? (
          <span className="mt-1 hidden truncate text-[0.75rem] leading-tight text-muted sm:block">
            {brand.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  )
}
