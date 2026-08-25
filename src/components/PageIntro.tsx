import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SectionLabel } from './SectionLabel'

export function PageIntro({
  index,
  eyebrow,
  title,
  description,
  aside,
}: {
  index: string
  eyebrow: string
  title: ReactNode
  description: string
  aside?: ReactNode
}) {
  return (
    <section className="page-shell pb-10 pt-12 sm:pb-14 sm:pt-16 lg:pb-16 lg:pt-20">
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel index={index}>{eyebrow}</SectionLabel>
          <h1 className="max-w-4xl text-[clamp(2.65rem,7vw,5.7rem)] font-extrabold leading-[0.95] tracking-[-0.065em] text-paper">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {description}
          </p>
        </motion.div>
        {aside ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {aside}
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
