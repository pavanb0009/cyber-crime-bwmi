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
| Call scanner | Real local Hindi/English/Hinglish audio transcription with faster-whisper, timestamped evidence, bilingual scam-signal rules and an explainable 0–100 risk score |
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

### Run the local call scanner

Requirement: Python 3.9+. `faster-whisper` uses PyAV, whose wheel bundles the needed FFmpeg libraries, so a separate FFmpeg install is not required for this upload flow.

From the project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --port 8000
```

Keep that terminal open, then run the React app in a second terminal. Open **Call scan** and upload an audio recording.

The first analysis downloads the open-source model (`large-v3-turbo`, roughly 1.6 GB), so it needs internet access once. Everything after that runs locally with no paid API key.

Notes from testing on CPU:

- `large-v3-turbo` is the default because `small` produces largely unusable Hindi, and turbo is also faster in practice since it decodes with fewer layers.
- Transcription takes roughly as long as the recording itself, so keep demo clips to 30–60 seconds.
- Selecting **Hindi** or **English** in the UI is measurably more accurate than auto detect on short or noisy clips.
- To trade accuracy for a smaller download: `WHISPER_MODEL=small uvicorn app.main:app --port 8000`.

### Enable the AI semantic layer (recommended)

The scanner has two intelligence modes:

- **AI + rules** — a local open-source LLM (Qwen3 via [Ollama](https://ollama.com/download)) translates the call to English, understands the manipulation pattern, and returns an explainable **AI Scam Likelihood** plus quoted threat evidence. The deterministic rule engine runs alongside it as an explainability and safety layer.
- **Rules only** — if Ollama is not running, the app automatically falls back to the deterministic Hindi/English signal engine. Nothing breaks; the analysis is simply less nuanced.

To turn on the AI layer, install Ollama and pull the model once:

```bash
ollama pull qwen3:4b        # ~2.5 GB, fine on a laptop
# or, with more memory, for stronger classification:
ollama pull qwen3:8b        # ~5.2 GB
```

With Ollama running, start the backend as usual. Select a different model with:

```bash
OLLAMA_MODEL=qwen3:8b uvicorn app.main:app --port 8000
```

Check which mode is live at any time via `GET /health` (`"ai_engine": "ollama"` vs `"rules-only"`). The result panel also shows an **AI semantic analysis** / **Rule engine only** badge so a reviewer can see which path produced the result.

Two scores are shown, deliberately kept separate:

- **AI Scam Likelihood** — how strongly the conversation resembles known scam behaviour (from the LLM).
- **Behavioural Risk** — how dangerous the requests happening in the call are right now (from the weighted rule signals).

Hard overrides guarantee that unmistakable combinations — authority impersonation + threat + isolation/payment (digital arrest), or credential + remote-access requests — can never be scored as safe, regardless of which layer read the call.

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
- Python + FastAPI for local audio processing
- faster-whisper + Silero VAD for open-source speech recognition
- Qwen3 (via Ollama) for local translation + semantic scam analysis, with graceful fallback
- Deterministic Hindi/English scam-signal and risk engine (explainability + safety layer)

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
│   ├── CallScannerPage.tsx
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
backend/
├── app/
│   ├── main.py              # FastAPI endpoints, Whisper transcription, response assembly
│   ├── ai_scam_analyser.py  # Qwen3/Ollama translation + semantic analysis (primary)
│   ├── fusion.py            # Combines LLM + rules, hard overrides, final scores
│   └── scam_detector.py     # Deterministic signal engine (explainability + fallback)
└── requirements.txt
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

The independent-prototype disclosure is persistent. No official logo is copied. All IDs, complaint counts, people, domains and case events are fictional. Report-flow evidence stays in the browser; call recordings are sent only to the separately started local FastAPI service for transcription.

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
