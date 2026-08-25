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
    <section className="page-shell pb-10 pt-12 sm:pb-12 sm:pt-16">
      <p className="text-sm text-muted">{eyebrow}</p>
      <div className="mt-3 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <h1 className="max-w-3xl text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-paper">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-7 text-muted">
            {description}
          </p>
        </div>
        {aside}
      </div>
    </section>
  )
}
