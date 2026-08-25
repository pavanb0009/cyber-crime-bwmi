import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('mb-5 flex items-center gap-3', className)}>
      {index ? (
        <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-signal">
          {index}
        </span>
      ) : null}
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/[0.15] to-transparent" />
    </div>
  )
}
