# RAKSHAK

A citizen-first redesign of India’s cybercrime reporting experience, built as an **independent hackathon prototype** with React, TypeScript and Tailwind CSS.

![Rakshak desktop preview](./preview-desktop.png)

The concept begins with the moment a citizen is actually in: confused, anxious and unsure which portal category to choose. Instead of exposing the information architecture first, Rakshak asks **“What happened?”**, surfaces the urgent action, and moves the person into one of three clear outcomes:

1. Report an incident.
2. Check a suspicious identifier.
3. Track what happens next.

> This project does not use official branding, live government APIs or real complaint data. Every record and identifier is synthetic and stored only in the browser.

## What is implemented

| Journey | Working behaviour |
|---|---|
| Home / response navigator | Existing hero and incident cards preserved, plus “I just lost money” Golden Minutes entry and a local natural-language Cybercrime Copilot |
| Report cybercrime | Existing four-step journey preserved and expanded with contextual forms by incident, Golden Minutes mode, voice input, evidence classification, completeness score, extraction, auto timeline, action plan, review, consent and acknowledgement generation |
| Check suspect | Existing phone/UPI/email/URL scanner preserved and expanded with 0–100 risk scoring, linked identifiers, patterns, “report this identifier”, “I already paid”, and a deterministic screenshot scam scanner |
| Track complaint | Existing local case search/timeline preserved, plus a financial Money Recovery Tracker and optional frozen-account/lien-help demo flow |
| Learning corner | Searchable/filterable situation playbooks, emergency actions, expandable guidance and an interactive scam-signal checklist |
| Accessibility | Keyboard focus states, larger-text mode, reduced-motion mode, mobile-first controls and a persistent mobile 1930 action |

## Reviewer demo — under 60 seconds

### Fastest complete path

1. Open **Report**.
2. Choose **Money or payment fraud**.
3. Continue and click **Use demo details**.
4. Continue and click **Add demo evidence**.
5. Continue; enter:
   - Name: `Aarav Demo`
   - Mobile: `9000001930`
6. Confirm the synthetic-data notice and create the demo complaint.
7. Open **Track this demo case** to see the locally generated timeline.

### Ready-made test values

| Feature | Demo value |
|---|---|
| Track case | `RK-DEMO-26-84021` |
| Flagged phone | `9876543210` |
| Flagged UPI ID | `refunddesk@upi` |
| Caution email | `support-kys@example.com` |
| Flagged URL | `https://secure-update.example` |

## Run locally

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

Production build:

```bash
npm run build
npm run preview
```

## Instant no-install preview

`preview.html` is a dependency-free visual preview of the homepage direction. It includes the interactive response navigator and can be opened directly in a browser. It is not a substitute for the React application; the complete workflows live in `src/`.

- Desktop capture: `preview-desktop.png`
- Mobile capture: `preview-mobile.png`

## Technical stack

- React 19 + TypeScript
- React Router
- Tailwind CSS 3.4
- Framer Motion
- Lucide icons
- Fontsource variable fonts
- Browser `localStorage` for synthetic drafts and cases

## Project structure

```text
src/
├── components/
│   ├── AccessibilityMenu.tsx
│   ├── BrandMark.tsx
│   ├── Button.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── PageIntro.tsx
│   ├── PrototypeBar.tsx
│   └── SiteHeader.tsx
├── data/
│   ├── brand.ts
│   └── content.ts
├── lib/
│   ├── cx.ts
│   ├── intelligence.ts
│   └── storage.ts
├── pages/
│   ├── CheckPage.tsx
│   ├── ContactPage.tsx
│   ├── HomePage.tsx
│   ├── LearnPage.tsx
│   ├── ReportPage.tsx
│   ├── TrackPage.tsx
│   └── VolunteersPage.tsx
├── App.tsx
├── index.css
├── main.tsx
└── types.ts
```

## Product decisions

### 1. Triage before navigation

A citizen should not need to understand police categories while under stress. The homepage starts from familiar situations such as “Money left my account” or “Someone took my account,” then gives the immediate instruction and correct route.

### 2. One urgent action

Financial fraud is treated differently because speed matters. The 1930 call action appears in context, in the navigation, in financial-report screens and as a persistent mobile action without making every screen feel alarming.

### 3. Human-language status

The tracking experience avoids opaque internal codes. It shows what is completed, the active stage, who currently owns the case and what the citizen should expect next.

### 4. Secure, consistent, not decorative

The rebuild keeps the existing white/blue Cyber Rakshak visual system, cards, hero assets and navigation patterns. Security cues are added through restrained scanning motion, local-data labels, evidence sealing language, structured risk panels and clearly separated emergency states rather than replacing the UI with a different theme.

### 5. Honest prototype boundary

The independent-prototype disclosure is persistent. No official logo is copied. All IDs, complaint counts, people, domains and case events are fictional. File contents are never uploaded; only file names are stored in the local draft.

## Existing-service coverage

The prototype retains the portal’s primary citizen-facing services while simplifying their presentation:

- Financial-fraud complaint route and 1930 escalation
- Other cybercrime reporting
- Women/child sensitive and anonymous reporting route
- Complaint tracking
- Suspect repository checks for phone, UPI, email and website
- Suspicious-identifier reporting handoff
- Cyber-safety learning content

The pre-existing Volunteers and Contact screens remain available so earlier UI work is not removed. They are not connected to live government or law-enforcement systems.

## Production integration boundaries

A real deployment would need approved, audited integrations for:

- Citizen authentication and OTP verification
- Secure evidence upload, malware scanning and retention
- NCRP/police case creation and status events
- Jurisdiction routing
- Bank/payment-provider escalation
- Notification delivery
- Multilingual content governance
- Accessibility and security audits

The UI deliberately labels simulated outcomes instead of pretending these integrations exist.

## Deployment

The app is compatible with Vercel, Netlify and other static hosts. SPA fallback files are included:

- `vercel.json`
- `public/_redirects`

For any static host, route all unknown paths to `index.html`.

## Codex documentation

Use `CODEX_WORKLOG_TEMPLATE.md` to record your team’s **actual** Codex sessions, human review decisions and verification commands. The template is intentionally blank so the submission does not fabricate process evidence.

## Validation note

The source was parsed and TypeScript-checked with temporary local dependency shims, and both desktop and mobile visual previews were rendered in Chromium. The build environment used to create this package could not reach the npm registry, so run `npm install && npm run build` on a connected machine before submission.

## License

MIT. See `LICENSE`.
