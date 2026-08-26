import { Link } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'
import { buttonStyles } from '../components/Button'
import { cx } from '../lib/cx'

const roles = [
  {
    title: 'Cyber awareness promoter',
    description:
      'Run local awareness sessions on fraud patterns, safe payments and how to preserve evidence.',
  },
  {
    title: 'Cyber volunteer — unlawful content flagger',
    description:
      'Flag harmful or unlawful content you come across so the right unit can review it.',
  },
  {
    title: 'Cyber expert',
    description:
      'Support investigations with skills in forensics, malware analysis, networks or cryptography.',
  },
]

export function VolunteersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Cyber volunteers"
        title="Help your neighbourhood stay safer online."
        description="This prototype shows how a volunteer programme could be presented: clear roles, honest expectations and no access to complaint data."
        aside="Volunteers support awareness and flagging. They never handle complaints."
      />

      <section className="page-shell page-section pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map((role) => (
            <div key={role.title} className="card border-t-2 border-t-brand p-5 sm:p-6">
              <p className="text-[1.05rem] font-semibold text-paper">{role.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{role.description}</p>
            </div>
          ))}
        </div>

        <div className="surface-soft mt-4 p-5 sm:p-7">
          <p className="eyebrow">Before you apply</p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-paper">
            <li>Volunteers never receive complainant details, case files or investigation access.</li>
            <li>Registration in a real programme requires identity verification by the state nodal officer.</li>
            <li>This page is part of an independent prototype, so no application is submitted anywhere.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/learn" className={cx(buttonStyles('primary', 'lg'))}>
              Read the safety library
            </Link>
            <Link to="/contact" className={cx(buttonStyles('secondary', 'lg'))}>
              Contact the team
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
