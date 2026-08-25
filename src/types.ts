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

export interface ReportDraft {
  incidentType: IncidentTypeId | ''
  anonymous: boolean
  occurredAt: string
  state: string
  channel: string
  amount: string
  transactionId: string
  description: string
  evidenceNames: string[]
  fullName: string
  mobile: string
  email: string
  consent: boolean
}

export interface CaseTimelineItem {
  label: string
  detail: string
  timestamp: string
  status: 'done' | 'active' | 'pending'
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
  timeline: CaseTimelineItem[]
}

export interface SuspectResult {
  risk: RiskLevel
  title: string
  summary: string
  reports: number | null
  firstSeen: string | null
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
