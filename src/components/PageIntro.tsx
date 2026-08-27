import type { ReactNode } from 'react'

export function PageIntro({
  title,
  aside,
}: {
  title: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="page-shell pb-4 pt-6 sm:pb-5 sm:pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-paper sm:text-[1.55rem]">
          {title}
        </h1>
        {aside}
      </div>
    </section>
  )
}
