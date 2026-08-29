#!/usr/bin/env node
/**
 * apply-notice-verifier.mjs
 * -------------------------------------------------------------------------
 * One-shot, idempotent installer for the Universal Government Notice Verifier.
 *
 * WHAT IT DOES
 *   1. Copies the two new source files (noticeVerifier.ts, NoticeVerifierPage.tsx)
 *      into src/lib and src/pages.
 *   2. Registers the /notice-verifier route in src/App.tsx.
 *   3. Adds the nav item to src/components/SiteHeader.tsx.
 *   4. Inserts the `noticeVerifier` label into every locale's nav block in
 *      src/i18n/common.ts.
 *
 * HOW TO RUN  (from the project root, i.e. the folder containing package.json):
 *   Put this file plus noticeVerifier.ts and NoticeVerifierPage.tsx in the same
 *   directory, then:
 *       node path/to/apply-notice-verifier.mjs
 *   Or copy all three into the project root and run:
 *       node apply-notice-verifier.mjs
 *
 * Safe to run more than once - every edit checks before it writes.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// Find the project root: the nearest ancestor (including CWD / this dir) that
// has a package.json with a "src" folder.
function findRoot() {
  for (const start of [process.cwd(), here]) {
    let dir = resolve(start)
    for (let i = 0; i < 6; i++) {
      if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'src'))) return dir
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  return null
}

const root = findRoot()
if (!root) {
  console.error('✗ Could not find the project root (a folder with package.json and src/).')
  console.error('  Run this script from inside the project, or copy it into the project root.')
  process.exit(1)
}
console.log('• Project root:', root)

const log = (ok, msg) => console.log(`  ${ok ? '✓' : '•'} ${msg}`)

function patchFile(relPath, transform) {
  const abs = join(root, relPath)
  if (!existsSync(abs)) {
    console.error(`✗ Missing file: ${relPath}`)
    process.exit(1)
  }
  const before = readFileSync(abs, 'utf8')
  const after = transform(before)
  if (after !== before) {
    writeFileSync(abs, after, 'utf8')
    log(true, `patched ${relPath}`)
  } else {
    log(false, `${relPath} already up to date`)
  }
}

// --- 1. Copy the two new source files --------------------------------------
for (const [file, dest] of [
  ['noticeVerifier.ts', 'src/lib/noticeVerifier.ts'],
  ['NoticeVerifierPage.tsx', 'src/pages/NoticeVerifierPage.tsx'],
]) {
  const srcFile = join(here, file)
  if (!existsSync(srcFile)) {
    console.error(`✗ Cannot find ${file} next to this script. Keep all three files together.`)
    process.exit(1)
  }
  copyFileSync(srcFile, join(root, dest))
  log(true, `installed ${dest}`)
}

// --- 2. Route in App.tsx ----------------------------------------------------
patchFile('src/App.tsx', (s) => {
  if (!s.includes("import { NoticeVerifierPage }")) {
    s = s.replace(
      "import { ReportPage } from './pages/ReportPage'",
      "import { NoticeVerifierPage } from './pages/NoticeVerifierPage'\nimport { ReportPage } from './pages/ReportPage'",
    )
  }
  if (!s.includes('path="notice-verifier"')) {
    s = s.replace(
      '<Route path="call-scanner" element={<CallScannerPage />} />',
      '<Route path="call-scanner" element={<CallScannerPage />} />\n        <Route path="notice-verifier" element={<NoticeVerifierPage />} />',
    )
  }
  return s
})

// --- 3. Nav item in SiteHeader.tsx -----------------------------------------
patchFile('src/components/SiteHeader.tsx', (s) => {
  if (!s.includes("key: 'nav.noticeVerifier'")) {
    s = s.replace(
      "{ to: '/call-scanner', key: 'nav.callScan' },",
      "{ to: '/call-scanner', key: 'nav.callScan' },\n  { to: '/notice-verifier', key: 'nav.noticeVerifier' },",
    )
  }
  return s
})

// --- 4. i18n labels in common.ts -------------------------------------------
const NAV_LABELS = {
  en: 'Notice check', hi: 'नोटिस जाँच', te: 'నోటీసు తనిఖీ', ta: 'அறிவிப்பு சரிபார்',
  kn: 'ನೋಟಿಸ್ ಪರಿಶೀಲನೆ', ml: 'നോട്ടീസ് പരിശോധന', mr: 'नोटीस तपासा', bn: 'নোটিশ যাচাই',
  as: 'নোটিচ পৰীক্ষা', gu: 'નોટિસ ચકાસો', or: 'ନୋଟିସ୍ ଯାଞ୍ଚ', pa: 'ਨੋਟਿਸ ਜਾਂਚ', ur: 'نوٹس جانچ',
}

patchFile('src/i18n/common.ts', (s) => {
  // 4a. Multi-line English nav block.
  if (!s.includes("noticeVerifier: 'Notice check'")) {
    s = s.replace(
      "      callScan: 'Call scan',\n",
      "      callScan: 'Call scan',\n      noticeVerifier: 'Notice check',\n",
    )
  }
  // 4b. Single-line nav objects, in the order the locales appear after `en`.
  const order = Object.keys(NAV_LABELS).filter((k) => k !== 'en')
  let idx = 0
  s = s.replace(/nav:\s*\{[^}]*callScan:\s*'[^']*',[^}]*\}/g, (block) => {
    if (block.includes('noticeVerifier:')) return block
    const label = NAV_LABELS[order[idx]] ?? 'Notice check'
    idx += 1
    return block.replace(
      /(callScan:\s*'[^']*',)/,
      `$1 noticeVerifier: '${label}',`,
    )
  })
  return s
})

console.log('\n✓ Done. Next steps:')
console.log('    npm run dev      # or: npm run build')
console.log('    open http://localhost:5173/notice-verifier')
