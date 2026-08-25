import { FlaskConical, LockKeyhole } from 'lucide-react'

export function PrototypeBar() {
  return (
    <div className="bg-signal text-ink">
      <div className="page-shell flex min-h-8 items-center justify-center gap-4 py-2 font-mono text-[0.56rem] font-bold uppercase tracking-[0.12em] sm:text-[0.6rem] md:justify-between">
        <div className="flex items-center gap-2 text-center md:text-left">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Independent hackathon prototype · not an official government website</span>
        </div>
        <div className="hidden items-center gap-2 opacity-[0.65] md:flex">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          Fictional data only
        </div>
      </div>
    </div>
  )
}
