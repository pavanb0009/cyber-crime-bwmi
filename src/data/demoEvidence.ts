/** Bundled demo evidence for reviewers - works in production without uploading real files. */

export type DemoEvidenceSample = {
  id: string
  fileName: string
  label: string
  kindHint: string
  body: string
  mime: string
}

export const demoEvidenceSamples: DemoEvidenceSample[] = [
  {
    id: 'upi-receipt',
    fileName: 'upi_payment_receipt.png',
    label: 'UPI payment receipt',
    kindHint: 'Transaction proof',
    mime: 'image/png',
    body: [
      'DEMO EVIDENCE - UPI payment receipt',
      'Amount: ₹85,000',
      'To: refunddesk@upi',
      'Txn ID: 412345678901',
      'Time: 24 Aug 2026, 18:21',
      'Note: Fake customer-care collect request.',
    ].join('\n'),
  },
  {
    id: 'whatsapp-chat',
    fileName: 'whatsapp_chat_scammer.png',
    label: 'WhatsApp chat',
    kindHint: 'Chat screenshot',
    mime: 'image/png',
    body: [
      'DEMO EVIDENCE - WhatsApp chat export',
      'Unknown: Your KYC will expire in 30 minutes.',
      'Unknown: Pay verification fee on refunddesk@upi.',
      'Unknown: Share the OTP sent to your phone.',
      'Citizen: I will call the bank myself.',
    ].join('\n'),
  },
  {
    id: 'bank-statement',
    fileName: 'bank_statement_excerpt.pdf',
    label: 'Bank statement',
    kindHint: 'Document / statement',
    mime: 'application/pdf',
    body: [
      'DEMO EVIDENCE - Bank statement excerpt',
      'Debit 24/08/2026  UPI/refunddesk@upi  -85000.00',
      'Balance after: insufficient for further debit.',
      'Keep original bank PDF in a real complaint.',
    ].join('\n'),
  },
  {
    id: 'suspect-profile',
    fileName: 'suspect_profile_instagram.png',
    label: 'Suspect profile',
    kindHint: 'Suspect profile',
    mime: 'image/png',
    body: [
      'DEMO EVIDENCE - Suspect profile capture',
      'Handle: @supportdesk11',
      'Bio: Official bank help · refunds in 10 min',
      'Created recently · few followers · pressure to share screen.',
    ].join('\n'),
  },
  {
    id: 'sms-alert',
    fileName: 'sms_refund_scam.txt',
    label: 'Refund SMS',
    kindHint: 'Text export',
    mime: 'text/plain',
    body: [
      'DEMO EVIDENCE - SMS alert',
      'Your Amazon refund of Rs.85000 failed. Confirm within 15 min:',
      'https://secure-update.example/refund',
      'Do not use links from unknown SMS in a real case.',
    ].join('\n'),
  },
]

export function makeDemoEvidenceFile(sample: DemoEvidenceSample): File {
  return new File([sample.body], sample.fileName, {
    type: sample.mime,
    lastModified: Date.now(),
  })
}
