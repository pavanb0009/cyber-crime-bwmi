import { brand } from '../data/brand'
import { deriveEvidenceItems } from './intelligence'
import type { CaseRecord, ReportDraft } from '../types'

const DRAFT_KEY = 'rakshak-report-draft-v2'
const LEGACY_DRAFT_KEY = 'rakshak-report-draft-v1'
const CASES_KEY = 'rakshak-demo-cases-v2'
const LEGACY_CASES_KEY = 'rakshak-demo-cases-v1'

export const emptyDraft: ReportDraft = {
  incidentType: '',
  anonymous: false,
  copilotText: '',
  occurredAt: '',
  state: '',
  channel: '',
  amount: '',
  paymentMethod: '',
  transactionId: '',
  recipientIdentifier: '',
  platform: '',
  remoteAccessAsked: '',
  accountPlatform: '',
  stillHasAccess: '',
  contactChanged: '',
  harassmentHandle: '',
  threatType: '',
  suspiciousIdentifier: '',
  malwareApp: '',
  description: '',
  evidenceNames: [],
  evidenceItems: [],
  fullName: '',
  mobile: '',
  email: '',
  consent: false,
  emergencyCaptured: false,
}

function normaliseDraft(value: Partial<ReportDraft>): ReportDraft {
  const names = Array.isArray(value.evidenceNames) ? value.evidenceNames : []
  return {
    ...emptyDraft,
    ...value,
    evidenceNames: names,
    evidenceItems: Array.isArray(value.evidenceItems) && value.evidenceItems.length
      ? value.evidenceItems
      : deriveEvidenceItems(names),
  }
}

export function loadDraft(): ReportDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(LEGACY_DRAFT_KEY)
    if (!raw) return { ...emptyDraft }
    return normaliseDraft(JSON.parse(raw) as Partial<ReportDraft>)
  } catch {
    return { ...emptyDraft }
  }
}

export function saveDraft(draft: ReportDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // The interface still works if storage is unavailable.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(LEGACY_DRAFT_KEY)
  } catch {
    // No-op when storage is unavailable.
  }
}

function normaliseCase(value: CaseRecord): CaseRecord {
  return {
    ...value,
    nextAction: value.nextAction ?? 'Wait for the next timeline update',
    evidenceCount: value.evidenceCount ?? 0,
  }
}

export function loadCases(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(CASES_KEY) ?? localStorage.getItem(LEGACY_CASES_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as CaseRecord[]).map(normaliseCase)
  } catch {
    return []
  }
}

export function saveCase(record: CaseRecord): void {
  try {
    const existing = loadCases().filter((item) => item.caseId !== record.caseId)
    localStorage.setItem(CASES_KEY, JSON.stringify([record, ...existing].slice(0, 8)))
  } catch {
    // No-op when storage is unavailable.
  }
}

export function findCase(caseId: string): CaseRecord | undefined {
  return loadCases().find((item) => item.caseId.toLowerCase() === caseId.toLowerCase())
}

export const defaultDemoCase: CaseRecord = {
  caseId: `${brand.casePrefix}-84021`,
  createdAt: '26 August 2026, 09:42',
  incidentType: 'financial',
  state: 'Karnataka',
  description: 'Synthetic demo complaint: stock-investment scam after WhatsApp and Telegram contact.',
  anonymous: false,
  progress: 76,
  statusLabel: 'Verification in progress',
  assignedUnit: 'Demo Cyber Cell — Bengaluru Urban',
  nextAction: 'Fund restoration review',
  amount: '85,000',
  paymentMethod: 'UPI',
  transactionId: 'DEMO-UPI-42384021',
  recipientIdentifier: 'merchant@upi',
  evidenceCount: 3,
  evidenceCompleteness: 75,
  recovery: {
    reported: 85000,
    traced: 65000,
    lien: 40000,
    restorationEligible: 40000,
    stage: 'review',
  },
  timeline: [
    {
      label: 'Complaint received',
      detail: 'Acknowledgement created and evidence package sealed locally.',
      timestamp: '09:42',
      status: 'done',
    },
    {
      label: 'Financial fraud identified',
      detail: 'Synthetic triage classified the report as an investment scam.',
      timestamp: '09:44',
      status: 'done',
    },
    {
      label: 'Beneficiary bank notified',
      detail: 'Simulated bank notification generated for the demo.',
      timestamp: '09:47',
      status: 'done',
    },
    {
      label: '₹65,000 located',
      detail: 'Synthetic tracing result found part of the reported amount.',
      timestamp: '10:03',
      status: 'done',
    },
    {
      label: '₹40,000 marked under lien',
      detail: 'Simulated hold placed on the traced beneficiary funds.',
      timestamp: '10:11',
      status: 'done',
    },
    {
      label: 'Cyber Cell assigned',
      detail: 'Case routed to the fictional Bengaluru Urban review queue.',
      timestamp: '11:20',
      status: 'done',
    },
    {
      label: 'Verification in progress',
      detail: 'Transaction and evidence details are being reviewed before restoration eligibility.',
      timestamp: 'Current',
      status: 'active',
    },
    {
      label: 'Fund restoration review',
      detail: 'Eligible lien-marked funds would move to restoration review next.',
      timestamp: 'Next',
      status: 'pending',
    },
  ],
}
