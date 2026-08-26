import type {
  CopilotResult,
  EvidenceItem,
  ExtractedEvidence,
  IncidentTypeId,
  ReportDraft,
} from '../types'

const moneyWords = ['money', 'upi', 'bank', 'transfer', 'paid', 'payment', 'refund', 'investment', 'crypto', 'wallet', 'card', 'lakh', 'rupee', '₹']
const arrestWords = ['cbi', 'police', 'digital arrest', 'money laundering', 'aadhaar', 'courier']
const accountWords = ['hacked', 'account', 'instagram', 'facebook', 'email', 'password', 'login', 'otp', 'takeover']
const harassmentWords = ['harass', 'stalk', 'threat', 'blackmail', 'sextort', 'abuse', 'bully']
const childWords = ['child', 'minor', 'groom', 'sexual', 'intimate image', 'csam']
const suspiciousWords = ['link', 'website', 'url', 'message', 'sms', 'number', 'phishing', 'kyc']
const malwareWords = ['apk', 'remote access', 'anydesk', 'teamviewer', 'malware', 'screen share', 'accessibility permission']

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value))
}

export function classifyIncident(input: string): CopilotResult {
  const text = input.trim().toLowerCase()
  const financial = includesAny(text, moneyWords)
  const arrest = includesAny(text, arrestWords)
  const malware = includesAny(text, malwareWords)

  if (financial && arrest) {
    return {
      incidentType: 'financial',
      label: 'Possible Digital Arrest Scam',
      severity: 'Critical',
      signals: ['Police/government impersonation', 'Financial fraud', 'Social engineering'],
      route: 'Emergency financial flow',
    }
  }
  if (financial) {
    return {
      incidentType: 'financial',
      label: malware ? 'Possible remote-access financial scam' : 'Possible financial fraud',
      severity: 'Critical',
      signals: malware ? ['Payment loss', 'Remote-access request', 'Credential risk'] : ['Payment/transfer language', 'Potential financial loss', 'Urgency or deception'],
      route: 'Emergency financial flow',
    }
  }
  if (includesAny(text, childWords)) {
    return {
      incidentType: 'women-child',
      label: 'Possible women/child safety incident',
      severity: 'Critical',
      signals: ['Sensitive safety concern', 'Potential exploitation', 'Evidence preservation needed'],
      route: 'Standard report',
    }
  }
  if (includesAny(text, harassmentWords)) {
    return {
      incidentType: 'harassment',
      label: 'Possible harassment / stalking',
      severity: 'High',
      signals: ['Threat or harassment language', 'Personal safety concern', 'Preserve account identifiers'],
      route: 'Standard report',
    }
  }
  if (includesAny(text, accountWords)) {
    return {
      incidentType: 'account',
      label: 'Possible account takeover / identity misuse',
      severity: 'High',
      signals: ['Account access concern', 'Identity/login indicators', 'Recovery action recommended'],
      route: 'Standard report',
    }
  }
  if (includesAny(text, suspiciousWords)) {
    return {
      incidentType: 'suspicious-content',
      label: 'Possible phishing / suspicious identifier',
      severity: 'Medium',
      signals: ['Suspicious communication', 'Identifier can be checked', 'Avoid interacting until verified'],
      route: 'Standard report',
    }
  }
  return {
    incidentType: 'other',
    label: malware ? 'Possible malware / device compromise' : 'Cyber incident needs review',
    severity: malware ? 'High' : 'Medium',
    signals: malware ? ['Device compromise indicators', 'Potential credential exposure', 'Isolation recommended'] : ['Insufficient signals for a narrower category', 'Human review recommended'],
    route: 'Standard report',
  }
}

export function classifyEvidenceName(name: string): EvidenceItem {
  const text = name.toLowerCase()
  if (/(upi|transaction|payment|bank|receipt)/.test(text)) return { name, kind: 'Transaction proof', confidence: 96 }
  if (/(whatsapp|telegram|chat|message)/.test(text)) return { name, kind: 'Chat screenshot', confidence: 94 }
  if (/(profile|account|instagram|facebook|suspect)/.test(text)) return { name, kind: 'Suspect profile', confidence: 91 }
  if (/\.(pdf)$/i.test(name)) return { name, kind: 'Document / statement', confidence: 86 }
  if (/\.(png|jpe?g|webp)$/i.test(name)) return { name, kind: 'Screenshot / image', confidence: 82 }
  if (/\.(txt)$/i.test(name)) return { name, kind: 'Text export', confidence: 78 }
  return { name, kind: 'Other evidence', confidence: 70 }
}

export function deriveEvidenceItems(names: string[]): EvidenceItem[] {
  return names.map(classifyEvidenceName)
}

export function extractEvidence(draft: ReportDraft): ExtractedEvidence {
  const combined = `${draft.description} ${draft.copilotText} ${draft.recipientIdentifier} ${draft.suspiciousIdentifier}`
  const phone = combined.match(/(?:\+91[\s-]?)?[6-9]\d{9}/)?.[0]
  const upi = combined.match(/[\w.-]{2,}@[\w.-]{2,}/)?.[0]
  const url = combined.match(/(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?/i)?.[0]

  return {
    phone: phone || (draft.recipientIdentifier.replace(/\D/g, '').length >= 10 ? draft.recipientIdentifier : undefined),
    upi: upi || (draft.recipientIdentifier.includes('@') ? draft.recipientIdentifier : undefined),
    amount: draft.amount || undefined,
    transactionId: draft.transactionId || undefined,
    platform: draft.platform || draft.channel || undefined,
    url: url || (draft.suspiciousIdentifier.includes('.') ? draft.suspiciousIdentifier : undefined),
  }
}

export function evidenceCompleteness(draft: ReportDraft): { score: number; present: string[]; missing: string[] } {
  const present: string[] = []
  const missing: string[] = []
  const hasTransactionProof = draft.evidenceItems.some((item) => item.kind === 'Transaction proof')
  const hasChat = draft.evidenceItems.some((item) => item.kind === 'Chat screenshot')
  const hasProfile = draft.evidenceItems.some((item) => item.kind === 'Suspect profile')
  const hasDocument = draft.evidenceItems.some((item) => item.kind.includes('Document'))

  const checks = draft.incidentType === 'financial'
    ? [
        ['Transaction ID', Boolean(draft.transactionId)],
        ['Recipient identifier', Boolean(draft.recipientIdentifier)],
        ['Transaction proof', hasTransactionProof],
        ['Chat / communication evidence', hasChat],
        ['Bank statement / supporting document', hasDocument],
      ] as const
    : draft.incidentType === 'account'
      ? [
          ['Platform', Boolean(draft.accountPlatform || draft.platform)],
          ['Approximate incident time', Boolean(draft.occurredAt)],
          ['Suspect/profile evidence', hasProfile || hasChat],
          ['Account recovery detail', Boolean(draft.stillHasAccess)],
        ] as const
      : [
          ['Approximate incident time', Boolean(draft.occurredAt)],
          ['Platform / channel', Boolean(draft.channel)],
          ['Relevant screenshot or document', draft.evidenceItems.length > 0],
          ['Suspect / identifier detail', Boolean(draft.suspiciousIdentifier || draft.harassmentHandle || draft.recipientIdentifier)],
        ] as const

  checks.forEach(([label, ok]) => (ok ? present.push(label) : missing.push(label)))
  const score = checks.length ? Math.round((present.length / checks.length) * 100) : 0
  return { score, present, missing }
}

export function getActionPlan(type: IncidentTypeId): string[] {
  const plans: Record<IncidentTypeId, string[]> = {
    financial: [
      'Call 1930 immediately.',
      'Contact your bank or payment provider and request urgent fraud assistance.',
      'Save the transaction ID, recipient UPI/account/phone and payment screenshot.',
      'Stop communicating with the scammer and preserve chats/screenshots.',
      'Do not install remote-access apps or share OTP/PIN credentials.',
    ],
    account: [
      'Change the password from a trusted device.',
      'End unknown sessions and recover the linked email/phone.',
      'Enable two-factor authentication.',
      'Preserve login alerts, profile URLs and attacker messages.',
      'Warn contacts if the compromised account sent messages.',
    ],
    harassment: [
      'Preserve messages, account URLs, timestamps and threats before blocking.',
      'Do not escalate or confront the person if it may increase risk.',
      'Use platform reporting and privacy tools after evidence is saved.',
      'Tell a trusted person and seek local emergency help for immediate physical danger.',
    ],
    'women-child': [
      'Move the affected person to safety and stop ongoing contact.',
      'Preserve identifiers and message details without redistributing illegal material.',
      'Use the sensitive reporting route; anonymous reporting is available in this prototype.',
      'Seek local authorities immediately if there is a direct risk of harm.',
    ],
    'suspicious-content': [
      'Do not click unknown links or make payments.',
      'Check the phone, UPI ID, email or website in Check Suspect.',
      'Verify through an independent official channel.',
      'Preserve the message or page as a screenshot if you plan to report it.',
    ],
    other: [
      'Disconnect the affected device from the internet if active compromise is suspected.',
      'Remove remote-access apps and review accessibility/device-admin permissions if relevant.',
      'Change sensitive credentials from another trusted device.',
      'Preserve logs, screenshots, filenames and timestamps before cleanup.',
    ],
  }
  return plans[type]
}

export function buildIncidentTimeline(draft: ReportDraft): Array<{ time: string; event: string }> {
  const base = draft.occurredAt ? new Date(draft.occurredAt) : new Date()
  const validBase = Number.isNaN(base.getTime()) ? new Date() : base
  const fmt = (date: Date) => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(date)
  const add = (minutes: number) => new Date(validBase.getTime() + minutes * 60_000)
  const items: Array<{ time: string; event: string }> = []

  items.push({ time: fmt(validBase), event: `Incident began via ${draft.channel || draft.platform || 'reported channel'}` })
  if (draft.incidentType === 'financial' && draft.amount) {
    items.push({ time: fmt(add(15)), event: `₹${draft.amount} reported as transferred${draft.paymentMethod ? ` via ${draft.paymentMethod}` : ''}` })
    if (draft.transactionId) items.push({ time: fmt(add(17)), event: `Transaction ${draft.transactionId} recorded` })
  }
  if (draft.incidentType === 'account') {
    items.push({ time: fmt(add(10)), event: `${draft.accountPlatform || 'Account'} access issue identified` })
    if (draft.contactChanged === 'yes') items.push({ time: fmt(add(18)), event: 'Linked email/phone change reported' })
  }
  if (draft.evidenceItems.length) items.push({ time: fmt(add(25)), event: `${draft.evidenceItems.length} evidence item${draft.evidenceItems.length === 1 ? '' : 's'} preserved` })
  items.push({ time: 'Now', event: 'Cyber Rakshak demo complaint prepared for submission' })
  return items
}
