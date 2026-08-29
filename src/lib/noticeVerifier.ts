// Universal Government Notice Verifier
// ---------------------------------------------------------------------------
// Heuristic, fully client-side analyser for suspicious "official" notices
// claiming to be from CBI, RBI, Police, ED, Customs, TRAI, courts, etc.
//
// IMPORTANT (and worth saying out loud in a demo): with no live government API
// this tool cannot certify that a notice is genuine. It detects *signals*. The
// most a clean result can say is "the format looks consistent" - never "safe".
// The verdicts are framed accordingly: genuine-format / suspicious / high-risk.

export type NoticeVerdict = 'genuine-format' | 'suspicious' | 'high-risk'
export type SignalSeverity = 'info' | 'warn' | 'danger'

export interface NoticeSignal {
  id: string
  label: string
  severity: SignalSeverity
  detail: string
  weight: number
}

export interface ExtractedNoticeFields {
  authority: string | null
  referenceNumber: string | null
  officer: string | null
  phones: string[]
  emails: string[]
  links: string[]
  paymentDemand: string | null
  amount: string | null
}

export interface NoticeAnalysis {
  verdict: NoticeVerdict
  score: number // 0-100, higher = more suspicious
  headline: string
  summary: string
  fields: ExtractedNoticeFields
  signals: NoticeSignal[]
  recommendedActions: string[]
  disclaimer: string
}

// --- Reference vocabulary ---------------------------------------------------

const AUTHORITIES: Array<{ id: string; label: string; patterns: RegExp[] }> = [
  { id: 'cbi', label: 'CBI (Central Bureau of Investigation)', patterns: [/\bC\.?B\.?I\.?\b/i, /central bureau of investigation/i] },
  { id: 'rbi', label: 'RBI (Reserve Bank of India)', patterns: [/\bR\.?B\.?I\.?\b/i, /reserve bank of india/i] },
  { id: 'ed', label: 'ED (Enforcement Directorate)', patterns: [/enforcement directorate/i, /\bE\.?D\.?\b(?!\w)/] },
  { id: 'police', label: 'Police', patterns: [/\bpolice\b/i, /cyber ?cell/i, /crime branch/i, /commissioner of police/i] },
  { id: 'customs', label: 'Customs', patterns: [/\bcustoms\b/i, /department of customs/i, /central board of indirect taxes/i] },
  { id: 'trai', label: 'TRAI (Telecom Regulatory Authority)', patterns: [/\bT\.?R\.?A\.?I\.?\b/i, /telecom regulatory authority/i, /department of telecom/i, /\bDoT\b/] },
  { id: 'court', label: 'Court / Judiciary', patterns: [/\bhon'?ble court\b/i, /district court/i, /high court/i, /supreme court/i, /summons/i, /\bwarrant\b/i] },
  { id: 'incometax', label: 'Income Tax Department', patterns: [/income tax department/i, /\bI\.?T\.?D\.?\b/] },
  { id: 'uidai', label: 'UIDAI (Aadhaar)', patterns: [/\bUIDAI\b/i, /aadhaar/i] },
  { id: 'ncb', label: 'NCB (Narcotics Control Bureau)', patterns: [/narcotics control bureau/i, /\bNCB\b/] },
]

// Free/consumer mail providers - a real authority would never use these.
const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com',
  'rediffmail.com', 'protonmail.com', 'icloud.com', 'live.com', 'ymail.com',
  'mail.com', 'zoho.com', 'gmx.com',
]

// Genuine central/state government mail + web is on these suffixes.
const GOV_DOMAIN_SUFFIXES = ['.gov.in', '.nic.in', 'rbi.org.in', '.gov', 'gov.in']

const PAYMENT_TERMS = [
  'pay', 'payment', 'fine', 'penalty', 'fee', 'charges', 'deposit', 'settle',
  'clearance', 'processing fee', 'security deposit', 'refundable', 'transfer',
  'upi', 'imps', 'neft', 'rtgs', 'bank transfer', 'wallet', 'bitcoin', 'crypto',
  'gift card', 'verification fee', 'unfreeze', 'release fee',
]

const URGENCY_TERMS = [
  'immediately', 'within 24 hours', 'within 2 hours', 'urgent', 'final notice',
  'last warning', 'failing which', 'legal action', 'non-bailable', 'arrest',
  'blocked', 'suspended', 'terminated', 'do not ignore', 'act now', 'today itself',
]

const SECRECY_TERMS = [
  'do not tell', 'do not inform', 'keep confidential', 'confidential',
  'do not disclose', 'without informing', 'digital arrest', 'stay on the call',
  'do not disconnect', 'monitored',
]

// --- Small helpers ----------------------------------------------------------

function uniq(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))]
}

function includesAny(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase()
  return needles.filter((n) => lower.includes(n))
}

// Phrases that flip a payment mention from "demand" to "advice/warning".
// Genuine advisories say things like "RBI does not ask for payment of any fee".
const NEGATION_MARKERS = [
  'does not', "doesn't", 'do not ask', 'never ask', 'never asks', 'will not ask',
  'no fee', 'without any', 'not required to pay', 'no payment', 'does not open',
  'caution', 'awareness', 'advisory', 'beware', 'fraud', 'scam',
]

// A payment term counts as a genuine *demand* only if it appears in a sentence
// that isn't a negation/advisory sentence. We segment on sentence boundaries and
// keep only demand-context hits.
function detectPaymentDemand(text: string): string[] {
  const sentences = text.split(/(?<=[.!?।\n])/)
  const hits = new Set<string>()
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()
    const negated = NEGATION_MARKERS.some((m) => lower.includes(m))
    if (negated) continue
    for (const term of PAYMENT_TERMS) {
      if (lower.includes(term)) hits.add(term)
    }
  }
  return [...hits]
}

function domainOf(emailOrUrl: string): string {
  const emailMatch = emailOrUrl.match(/@([\w.-]+)/)
  if (emailMatch) return emailMatch[1].toLowerCase()
  try {
    const url = new URL(emailOrUrl.startsWith('http') ? emailOrUrl : `https://${emailOrUrl}`)
    return url.hostname.toLowerCase()
  } catch {
    return emailOrUrl.toLowerCase()
  }
}

function isGovDomain(domain: string): boolean {
  return GOV_DOMAIN_SUFFIXES.some((suffix) => domain.endsWith(suffix))
}

function isFreeEmailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.includes(domain)
}

// --- Field extraction -------------------------------------------------------

export function extractNoticeFields(text: string): ExtractedNoticeFields {
  const authority = AUTHORITIES.find((a) => a.patterns.some((p) => p.test(text)))?.label ?? null

  // Reference / notice / case / F.No. numbers in many common shapes.
  const referenceNumber =
    text.match(/(?:ref(?:erence)?|notice|case|complaint|file|f\.?\s*no|diary|fir|din)\s*(?:no\.?|number|#|:)?\s*[:\-#]?\s*([A-Z0-9][A-Z0-9/\-.]{4,})/i)?.[1]?.trim() ??
    text.match(/\b([A-Z]{2,}[/-]\d{2,}[/-][A-Z0-9/-]{2,})\b/)?.[1]?.trim() ??
    null

  const officer =
    text.match(/(?:officer|inspector|i\.?o\.?|sho|dsp|acp|dcp|superintendent|investigating officer|signed by|authori[sz]ed by)\s*[:\-]?\s*((?:(?:Mr|Ms|Shri|Smt|Dr)\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/)?.[1]?.trim() ??
    null

  const phones = uniq([
    ...(text.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g) ?? []),
    ...(text.match(/\b1\d{3,4}\b/g) ?? []), // helpline-style short codes
  ])

  const emails = uniq(text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? [])

  const links = uniq(
    (text.match(/(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[\w\-./?%&=+#]*)?/gi) ?? [])
      .filter((l) => !l.includes('@')) // drop emails caught by the URL regex
      .filter((l) => /\.[a-z]{2,}/i.test(l)),
  )

  const paymentHits = detectPaymentDemand(text)
  const amount =
    text.match(/(?:₹|Rs\.?|INR)\s?([\d,]+(?:\.\d+)?)(?:\s?(?:lakh|lakhs|crore|thousand|k))?/i)?.[0]?.trim() ??
    null
  const paymentDemand = paymentHits.length ? paymentHits.slice(0, 4).join(', ') : null

  return { authority, referenceNumber, officer, phones, emails, links, paymentDemand, amount }
}

// --- Analysis ---------------------------------------------------------------

export function analyseNoticeText(rawText: string, fileName = ''): NoticeAnalysis {
  const text = `${rawText}\n${fileName}`.trim()
  const fields = extractNoticeFields(rawText)
  const signals: NoticeSignal[] = []

  const add = (s: NoticeSignal) => signals.push(s)

  // 1. Free / consumer email address used as an "official" contact.
  const freeEmails = fields.emails.filter((e) => isFreeEmailDomain(domainOf(e)))
  if (freeEmails.length) {
    add({
      id: 'free-email',
      label: 'Free email provider used',
      severity: 'danger',
      weight: 32,
      detail: `A genuine authority does not use ${uniq(freeEmails.map((e) => domainOf(e))).join(', ')}. Official mail ends in .gov.in or .nic.in.`,
    })
  }

  // 2. Non-government domain in links / emails.
  const contactDomains = uniq([...fields.emails, ...fields.links].map(domainOf))
  const nonGovDomains = contactDomains.filter((d) => d && !isGovDomain(d) && !isFreeEmailDomain(d))
  const govDomains = contactDomains.filter(isGovDomain)
  if (nonGovDomains.length) {
    add({
      id: 'non-gov-domain',
      label: 'Non-government domain',
      severity: 'warn',
      weight: 18,
      detail: `Contact points use ${nonGovDomains.slice(0, 3).join(', ')}, which is not an official government domain.`,
    })
  }
  if (govDomains.length) {
    add({
      id: 'gov-domain',
      label: 'Government domain present',
      severity: 'info',
      weight: -12,
      detail: `Uses an official-looking domain (${govDomains.slice(0, 2).join(', ')}). Confirm it is spelled exactly and not a look-alike.`,
    })
  }

  // 3. Payment / fee demand - the single strongest scam signal.
  if (fields.paymentDemand) {
    add({
      id: 'payment-demand',
      label: 'Payment or fee demanded',
      severity: 'danger',
      weight: 34,
      detail: `Mentions ${fields.paymentDemand}${fields.amount ? ` (${fields.amount})` : ''}. Government agencies never ask you to pay a fine, "verification" or "clearance" fee over a call or link.`,
    })
  }

  // 4. Urgency / threat pressure.
  const urgency = includesAny(text, URGENCY_TERMS)
  if (urgency.length >= 2) {
    add({
      id: 'urgency',
      label: 'Urgency / threat pressure',
      severity: 'warn',
      weight: 16,
      detail: `Pressure language detected: "${urgency.slice(0, 3).join('", "')}". Scams manufacture urgency so you act before you verify.`,
    })
  }

  // 5. Secrecy / "digital arrest" isolation tactic.
  const secrecy = includesAny(text, SECRECY_TERMS)
  if (secrecy.length) {
    add({
      id: 'secrecy',
      label: 'Secrecy / isolation tactic',
      severity: 'danger',
      weight: 30,
      detail: `Asks you to stay silent or stay on the line ("${secrecy.slice(0, 2).join('", "')}"). This is the core of the digital-arrest scam. No real agency demands secrecy.`,
    })
  }

  // 6. Reference number sanity.
  if (!fields.referenceNumber) {
    add({
      id: 'no-reference',
      label: 'No traceable reference number',
      severity: 'warn',
      weight: 14,
      detail: 'No case, notice or file number is present in a recognisable format. Genuine notices carry a verifiable reference.',
    })
  } else if (!/[/-]/.test(fields.referenceNumber) && !/[a-z]/i.test(fields.referenceNumber)) {
    // A bare run of digits (e.g. "99887766") with no department code or year is
    // the weak case. Structured refs like TRAI/DND/2024/0561209 are fine.
    add({
      id: 'weak-reference',
      label: 'Inconsistent reference format',
      severity: 'warn',
      weight: 10,
      detail: `Reference "${fields.referenceNumber}" is a plain number with no department code or year (genuine refs look like CBI/DL/2024/00123).`,
    })
  } else {
    add({
      id: 'reference-ok',
      label: 'Reference number present',
      severity: 'info',
      weight: -8,
      detail: `Carries a structured reference (${fields.referenceNumber}). Still verify it on the authority's official portal.`,
    })
  }

  // 7. Authority named but no official channel at all.
  if (fields.authority && govDomains.length === 0 && fields.phones.every((p) => p.length > 5)) {
    add({
      id: 'no-official-channel',
      label: 'No official channel to verify',
      severity: 'warn',
      weight: 12,
      detail: `Claims to be from ${fields.authority} but gives no .gov.in website or listed helpline to independently confirm it.`,
    })
  }

  // 8. QR / link to unknown destination.
  if (/\bqr\b|scan (?:this|the) (?:code|qr)/i.test(text)) {
    add({
      id: 'qr-code',
      label: 'QR / scan-to-pay present',
      severity: 'danger',
      weight: 24,
      detail: 'Contains a QR or "scan to pay/verify" instruction. Scanning a QR never receives money or "verifies" identity - it only sends payment.',
    })
  }

  // --- Scoring -------------------------------------------------------------
  const positiveWeight = signals.filter((s) => s.weight > 0).reduce((sum, s) => sum + s.weight, 0)
  const negativeWeight = signals.filter((s) => s.weight < 0).reduce((sum, s) => sum + s.weight, 0)
  const score = Math.max(0, Math.min(100, positiveWeight + negativeWeight))

  const dangerCount = signals.filter((s) => s.severity === 'danger').length

  let verdict: NoticeVerdict
  if (score >= 55 || dangerCount >= 2) verdict = 'high-risk'
  else if (score >= 25 || dangerCount >= 1) verdict = 'suspicious'
  else verdict = 'genuine-format'

  const headline =
    verdict === 'high-risk'
      ? 'High risk - strong indicators of a fake notice'
      : verdict === 'suspicious'
        ? 'Suspicious - verify before you act'
        : 'Format looks consistent, still verify independently'

  const summary =
    verdict === 'high-risk'
      ? `${dangerCount} serious scam signal${dangerCount === 1 ? '' : 's'} detected. Treat this as a scam attempt: do not pay, click, scan, or share any code.`
      : verdict === 'suspicious'
        ? 'Some signals do not match a genuine government notice. Do not act on it until you confirm through an official channel you looked up yourself.'
        : 'No strong scam signal was found, but this is not proof of authenticity. Confirm on the authority\u2019s official .gov.in portal or listed helpline before doing anything.'

  const recommendedActions =
    verdict === 'genuine-format'
      ? [
          'Independently look up the authority\u2019s official website and helpline; do not use the contacts in the notice.',
          'Confirm any reference number on the official portal.',
          'Never share OTPs, PINs, or screen access based on a notice alone.',
        ]
      : [
          'Do not pay any money, fine, or "verification" fee.',
          'Do not click links, scan QR codes, or install any app it asks for.',
          'Verify the claim by calling the authority on a number you find yourself, not one in the notice.',
          'If money was already sent, call the cybercrime helpline 1930 and file a complaint.',
        ]

  return {
    verdict,
    score,
    headline,
    summary,
    fields,
    signals: signals.sort((a, b) => b.weight - a.weight),
    recommendedActions,
    disclaimer:
      'Prototype heuristic checker. It detects scam signals in the notice text and cannot confirm that any notice is genuine. Always verify through an official government channel.',
  }
}

// --- Demo corpus: 8 documents (4 safe-looking, 4 fake) ----------------------

export interface DemoNotice {
  id: string
  label: string
  authorityHint: string
  expected: NoticeVerdict
  fileName: string
  text: string
}

export const demoNotices: DemoNotice[] = [
  {
    id: 'safe-incometax',
    label: 'Income Tax - refund intimation',
    authorityHint: 'Income Tax Department',
    expected: 'genuine-format',
    fileName: 'ITD_intimation_143-1.pdf',
    text: `INCOME TAX DEPARTMENT, GOVERNMENT OF INDIA
Intimation under Section 143(1)
Reference No: ITD/DIN/2024/AY2024-25/0098231
PAN: ABCDE1234F   Assessment Year: 2024-25
This is a system-generated intimation regarding your filed return. Any refund, if due, will be credited to your pre-validated bank account.
To view details, log in at the official portal incometax.gov.in using your registered credentials.
For assistance, call the toll-free helpline 1800-103-0025. Do not share your OTP or password with anyone.
Issued by: Centralized Processing Centre, Bengaluru.`,
  },
  {
    id: 'safe-rbi',
    label: 'RBI - public awareness advisory',
    authorityHint: 'RBI',
    expected: 'genuine-format',
    fileName: 'RBI_awareness_advisory.pdf',
    text: `RESERVE BANK OF INDIA
Public Awareness Advisory
Ref: RBI/2024-25/CEPD/114
The Reserve Bank of India cautions members of the public that RBI does not open accounts for individuals, nor does it ask for account details, OTPs or payment of any fee.
For grievances, use the official portal rbi.org.in or the Complaint Management System at cms.rbi.org.in.
Report suspicious activity to your bank. This advisory is issued in public interest by the Department of Communication.`,
  },
  {
    id: 'safe-trai',
    label: 'TRAI - DND registration confirmation',
    authorityHint: 'TRAI',
    expected: 'genuine-format',
    fileName: 'TRAI_DND_confirmation.pdf',
    text: `TELECOM REGULATORY AUTHORITY OF INDIA (TRAI)
Do Not Disturb (DND) Registration Confirmation
Reference Number: TRAI/DND/2024/0561209
Your request to register on the Do Not Disturb list has been processed. Preferences will take effect within 7 days.
For queries visit trai.gov.in or contact your telecom service provider. TRAI never asks for payment to activate DND.`,
  },
  {
    id: 'safe-court',
    label: 'District Court - hearing notice',
    authorityHint: 'Court',
    expected: 'genuine-format',
    fileName: 'court_hearing_notice.pdf',
    text: `IN THE COURT OF THE DISTRICT JUDGE, PUNE
Case No: DC/PUN/CIV/2024/00742
Notice of Hearing
The parties are informed that the next hearing in the above matter is scheduled as per the cause list published on the official portal districts.ecourts.gov.in.
Parties may verify the cause list and case status online. Signed by: Registrar (Judicial).`,
  },
  {
    id: 'fake-cbi-arrest',
    label: 'CBI - "digital arrest" summons',
    authorityHint: 'CBI',
    expected: 'high-risk',
    fileName: 'CBI_arrest_warrant_urgent.jpg',
    text: `CENTRAL BUREAU OF INVESTIGATION (CBI)
URGENT ARREST WARRANT - FINAL NOTICE
Your Aadhaar has been linked to a money laundering case. A non-bailable warrant has been issued in your name.
You are under DIGITAL ARREST. Do NOT disconnect the call and do not inform anyone, including family, as the matter is confidential and monitored.
To avoid immediate arrest, pay a refundable security deposit of Rs. 2,50,000 within 2 hours via UPI to clear your name.
Contact Investigating Officer Rajesh Kumar at cbi.officer.verify@gmail.com or +919876543210. Scan the QR code below to make the payment.`,
  },
  {
    id: 'fake-customs-parcel',
    label: 'Customs - parcel seizure',
    authorityHint: 'Customs',
    expected: 'high-risk',
    fileName: 'customs_parcel_seizure.pdf',
    text: `DEPARTMENT OF CUSTOMS
NOTICE: Illegal Parcel Detained In Your Name
A parcel containing illegal items has been seized under your name at the international airport. Legal action including arrest will follow immediately, failing which.
To release the parcel and avoid a court case, pay a clearance fee and penalty of Rs. 45,000 today itself via the payment link: http://customs-clearance-india.net/pay
Reply to customsindia.clearance@outlook.com. Do not ignore this final warning.`,
  },
  {
    id: 'fake-trai-disconnect',
    label: 'TRAI - SIM disconnection threat',
    authorityHint: 'TRAI',
    expected: 'high-risk',
    fileName: 'TRAI_sim_block_notice.jpg',
    text: `TRAI - TELECOM REGULATORY AUTHORITY
URGENT: Your mobile number will be SUSPENDED within 2 hours.
Your SIM is involved in illegal activity and harassment complaints. All your numbers will be blocked immediately.
To keep your number active, verify now by paying a verification fee of Rs. 999 via UPI. Stay on this call and do not disconnect.
Helpline officer: Anil Sharma, contact trai.verification.team@gmail.com. Act now.`,
  },
  {
    id: 'fake-police-ncb',
    label: 'Police/NCB - case settlement',
    authorityHint: 'Police',
    expected: 'high-risk',
    fileName: 'cyber_cell_notice_final.pdf',
    text: `MUMBAI CYBER CELL - CRIME BRANCH
Final Notice / Non-Bailable
Reference: 99887766
Your bank account is linked to a narcotics case under investigation by NCB. A warrant is being prepared against you.
This is confidential - do not disclose to anyone. To settle the matter out of court, transfer a security deposit via bank transfer or gift card immediately.
Failing which, legal action and arrest will be taken today. Contact officer at mumbaicyber.cell@gmail.com.`,
  },
]
