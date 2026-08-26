import type { ReactNode } from 'react'

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  index?: string
  eyebrow: string
  title: ReactNode
  description: string
  aside?: ReactNode
}) {
  return (
    <section className="page-shell pb-8 pt-10 sm:pb-10 sm:pt-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end lg:gap-12">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.025em] text-paper">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-muted">
            {description}
          </p>
        </div>
        {aside ? (
          <div className="surface-soft p-4 text-sm leading-6 text-muted lg:p-5">{aside}</div>
        ) : null}
      </div>
    </section>
  )
}
