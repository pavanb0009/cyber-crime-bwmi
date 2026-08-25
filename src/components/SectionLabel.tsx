import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export function SectionLabel({
  children,
  className,
}: {
  index?: string
  children: ReactNode
  className?: string
}) {
  return <p className={cx('mb-3 text-sm text-muted', className)}>{children}</p>
}
