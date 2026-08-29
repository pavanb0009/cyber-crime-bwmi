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

function svgDataUrl(markup: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup.trim())}`
}

const upiReceiptSvg = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640" viewBox="0 0 900 640">
  <rect width="900" height="640" fill="#f4f7fb"/>
  <rect width="900" height="76" fill="#1668cf"/>
  <text x="36" y="48" fill="#ffffff" font-family="ui-sans-serif,system-ui,sans-serif" font-size="28" font-weight="700">UPI payment receipt</text>
  <rect x="36" y="112" width="828" height="492" rx="20" fill="#ffffff" stroke="#d7dee8"/>
  <text x="64" y="168" fill="#1668cf" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700">DEMO EVIDENCE</text>
  <text x="64" y="230" fill="#101012" font-family="ui-sans-serif,system-ui,sans-serif" font-size="42" font-weight="800">INR 85,000</text>
  <text x="64" y="286" fill="#5a5a62" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20">Paid to refunddesk@upi</text>
  <text x="64" y="348" fill="#101012" font-family="ui-monospace,monospace" font-size="18">Txn ID  412345678901</text>
  <text x="64" y="388" fill="#101012" font-family="ui-monospace,monospace" font-size="18">Time    24 Aug 2026, 18:21</text>
  <text x="64" y="428" fill="#101012" font-family="ui-monospace,monospace" font-size="18">Note    Fake customer-care collect</text>
  <rect x="64" y="480" width="220" height="56" rx="12" fill="#c8102e"/>
  <text x="174" y="516" fill="#ffffff" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700" text-anchor="middle">Failed / disputed</text>
</svg>
`)

const bankSmsSvg = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640" viewBox="0 0 900 640">
  <rect width="900" height="640" fill="#eef2f6"/>
  <rect width="900" height="76" fill="#1668cf"/>
  <text x="36" y="48" fill="#ffffff" font-family="ui-sans-serif,system-ui,sans-serif" font-size="28" font-weight="700">Bank SMS export</text>
  <rect x="90" y="140" width="720" height="380" rx="28" fill="#ffffff"/>
  <text x="130" y="200" fill="#5a5a62" font-family="ui-sans-serif,system-ui,sans-serif" font-size="16">SBI ALERT - 24 Aug, 18:22</text>
  <text x="130" y="260" fill="#101012" font-family="ui-sans-serif,system-ui,sans-serif" font-size="26" font-weight="700">INR 85,000 debited via UPI</text>
  <text x="130" y="318" fill="#101012" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20">To: refunddesk@upi</text>
  <text x="130" y="360" fill="#101012" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20">Ref: 412345678901</text>
  <text x="130" y="430" fill="#c8102e" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700">Keep this SMS. Do not share OTPs.</text>
</svg>
`)

const whatsappChatSvg = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640" viewBox="0 0 900 640">
  <rect width="900" height="640" fill="#ece5dd"/>
  <rect width="900" height="76" fill="#075e54"/>
  <text x="36" y="48" fill="#ffffff" font-family="ui-sans-serif,system-ui,sans-serif" font-size="28" font-weight="700">WhatsApp chat</text>
  <rect x="80" y="120" width="560" height="88" rx="16" fill="#ffffff"/>
  <text x="104" y="158" fill="#111b21" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20">Your KYC will expire in 30 minutes.</text>
  <text x="104" y="188" fill="#667781" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14">Unknown - 18:09</text>
  <rect x="80" y="228" width="620" height="88" rx="16" fill="#ffffff"/>
  <text x="104" y="266" fill="#111b21" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20">Pay verification on refunddesk@upi.</text>
  <text x="104" y="296" fill="#667781" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14">Unknown - 18:10</text>
  <rect x="260" y="336" width="560" height="88" rx="16" fill="#d9fdd3"/>
  <text x="284" y="374" fill="#111b21" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20">I will call the bank myself. No OTP.</text>
  <text x="284" y="404" fill="#667781" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14">You - 18:11</text>
  <text x="80" y="500" fill="#c8102e" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700">DEMO EVIDENCE - preserve full chat before blocking</text>
</svg>
`)

export const bundledEvidenceAssets = [
  {
    name: 'upi-collect-screenshot.png',
    type: 'image/svg+xml',
    url: upiReceiptSvg,
    size: 18_432,
  },
  {
    name: 'bank-sms.png',
    type: 'image/svg+xml',
    url: bankSmsSvg,
    size: 12_288,
  },
  {
    name: 'whatsapp-chat.png',
    type: 'image/svg+xml',
    url: whatsappChatSvg,
    size: 16_384,
  },
] as const

export function bundledPreviewUrl(name: string): string | undefined {
  const exact = bundledEvidenceAssets.find((asset) => asset.name === name)?.url
  if (exact) return exact
  const stem = name.replace(/\.[^.]+$/, '')
  return bundledEvidenceAssets.find((asset) => asset.name.replace(/\.[^.]+$/, '') === stem)?.url
}

export function bundledEvidenceFiles(): Array<{ name: string; type: string; size: number; url: string }> {
  return bundledEvidenceAssets.map((asset) => ({
    name: asset.name,
    type: 'image/png',
    size: asset.size,
    url: asset.url,
  }))
}

export async function loadBundledEvidenceFiles(): Promise<File[]> {
  return Promise.all(bundledEvidenceAssets.map(assetToPngFile))
}

async function assetToPngFile(asset: (typeof bundledEvidenceAssets)[number]): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${asset.name}`))
    img.src = asset.url
  })
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 640
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not draw sample evidence.')
  context.drawImage(image, 0, 0, 900, 640)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error('Could not encode screenshot.'))), 'image/png')
  })
  return new File([blob], asset.name, { type: 'image/png', lastModified: Date.now() })
}
