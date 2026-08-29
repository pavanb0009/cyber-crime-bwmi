import { brand } from '../data/brand'
import { bundledEvidenceFiles } from '../data/demoEvidence'
import type { CaseRecord, ReportDraft } from '../types'

const DRAFT_KEY = 'rakshak-report-draft-v1'
const CASES_KEY = 'rakshak-cases-v1'

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
  otherIncident: '',
  description: '',
  evidenceNames: [],
  evidenceItems: [],
  fullName: '',
  mobile: '',
  email: '',
  consent: false,
  emergencyCaptured: false,
}

export function loadDraft(): ReportDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft
    return { ...emptyDraft, ...(JSON.parse(raw) as Partial<ReportDraft>) }
  } catch {
    return emptyDraft
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
  } catch {
    // No-op when storage is unavailable.
  }
}

export function loadCases(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(CASES_KEY)
    return raw ? (JSON.parse(raw) as CaseRecord[]) : []
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

export const defaultCase: CaseRecord = {
  caseId: `${brand.casePrefix}-84019`,
  createdAt: '24 August 2026, 18:42',
  incidentType: 'financial',
  state: 'Karnataka',
  description: 'Fake customer-care UPI collection request.',
  anonymous: false,
  progress: 68,
  statusLabel: 'Under review by state cyber cell',
  assignedUnit: 'Cyber Crime Cell - Bengaluru Urban',
  amount: '85,000',
  paymentMethod: 'UPI',
  transactionId: '412345678901',
  recipientIdentifier: 'refunddesk@upi',
  nextAction: 'Beneficiary tracing and lien review',
  evidenceCount: 3,
  evidenceCompleteness: 72,
  evidenceFiles: bundledEvidenceFiles(),
  recovery: {
    reported: 85000,
    traced: 65000,
    lien: 40000,
    restorationEligible: 40000,
    stage: 'review',
  },
  timeline: [
    {
      label: 'Complaint submitted',
      detail: 'Acknowledgement generated and evidence package sealed.',
      timestamp: '24 Aug · 18:42',
      status: 'done',
    },
    {
      label: 'Initial triage complete',
      detail: 'Incident category and jurisdiction verified.',
      timestamp: '24 Aug · 19:06',
      status: 'done',
    },
    {
      label: 'Forwarded to state cyber cell',
      detail: 'Case routed to the relevant review queue.',
      timestamp: '24 Aug · 19:24',
      status: 'done',
    },
    {
      label: 'Officer review',
      detail: 'Evidence and transaction details are being examined.',
      timestamp: 'Current stage',
      status: 'active',
    },
    {
      label: 'Action update',
      detail: 'A new update will appear here when available.',
      timestamp: 'Pending',
      status: 'pending',
    },
  ],
}
