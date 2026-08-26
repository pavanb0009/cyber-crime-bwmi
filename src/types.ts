import type { LucideIcon } from 'lucide-react'

export type IncidentTypeId =
  | 'financial'
  | 'account'
  | 'harassment'
  | 'women-child'
  | 'suspicious-content'
  | 'other'

export type IdentifierType = 'phone' | 'upi' | 'email' | 'url'
export type RiskLevel = 'high' | 'medium' | 'clear'

export interface IncidentType {
  id: IncidentTypeId
  title: string
  description: string
  hint: string
  icon: LucideIcon
  tone: 'coral' | 'aqua' | 'signal' | 'saffron'
}

export interface EvidenceItem {
  name: string
  kind: string
  confidence: number
}

export interface ExtractedEvidence {
  phone?: string
  upi?: string
  amount?: string
  transactionId?: string
  platform?: string
  url?: string
}

export interface ReportDraft {
  incidentType: IncidentTypeId | ''
  anonymous: boolean
  copilotText: string
  occurredAt: string
  state: string
  channel: string
  amount: string
  paymentMethod: string
  transactionId: string
  recipientIdentifier: string
  platform: string
  remoteAccessAsked: string
  accountPlatform: string
  stillHasAccess: string
  contactChanged: string
  harassmentHandle: string
  threatType: string
  suspiciousIdentifier: string
  malwareApp: string
  description: string
  evidenceNames: string[]
  evidenceItems: EvidenceItem[]
  fullName: string
  mobile: string
  email: string
  consent: boolean
  emergencyCaptured: boolean
}

export interface CaseTimelineItem {
  label: string
  detail: string
  timestamp: string
  status: 'done' | 'active' | 'pending'
}

export interface MoneyRecovery {
  reported: number
  traced: number
  lien: number
  restorationEligible: number
  stage: 'reported' | 'traced' | 'lien' | 'review' | 'refunded'
}

export interface CaseRecord {
  caseId: string
  createdAt: string
  incidentType: IncidentTypeId
  state: string
  description: string
  anonymous: boolean
  progress: number
  statusLabel: string
  assignedUnit: string
  nextAction?: string
  amount?: string
  paymentMethod?: string
  transactionId?: string
  recipientIdentifier?: string
  evidenceCount?: number
  evidenceCompleteness?: number
  recovery?: MoneyRecovery
  timeline: CaseTimelineItem[]
}

export interface SuspectResult {
  risk: RiskLevel
  score?: number
  title: string
  summary: string
  reports: number | null
  firstSeen: string | null
  lastSeen?: string | null
  pattern?: string
  related?: string[]
  signals: string[]
  nextSteps: string[]
}

export interface SafetyGuide {
  id: string
  category: 'Money' | 'Accounts' | 'Harassment' | 'Family' | 'General'
  title: string
  summary: string
  readingTime: string
  steps: string[]
  accent: 'signal' | 'aqua' | 'coral' | 'saffron'
}

export interface CopilotResult {
  incidentType: IncidentTypeId
  label: string
  severity: 'Critical' | 'High' | 'Medium'
  signals: string[]
  route: 'Emergency financial flow' | 'Standard report'
}
