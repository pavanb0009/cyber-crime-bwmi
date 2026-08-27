# CyberDesk rebuild — feature coverage

This rebuild is additive. Existing routes, hero assets, incident cards, Learn, Volunteers, Contact, accessibility controls, local draft storage, identifier checks and local complaint tracking remain in the project.

## Roadmap features now represented in the UI

1. Functional 4-step complaint flow — Incident → Details → Evidence → Review.
2. Contextual incident questions — financial, account takeover, harassment/women-child, suspicious identifier, other/device compromise.
3. Local evidence upload — image/PDF/text filenames only; no content upload.
4. Evidence classification — transaction proof, chat screenshot, suspect profile, document, screenshot/image.
5. Review + local acknowledgement — demo ID, downloadable summary, track action, next steps.
6. Human-readable complaint tracking timeline.
7. Golden Minutes / “I just lost money” mode — amount, payment method, transaction ID, recipient identifier, simulated response actions and 1930 emphasis.
8. Money Recovery Tracker — reported → traced → lien → restoration review → refund.
9. Identifier scanner — Phone / UPI / Email / URL, 0–100 risk score, pattern, related identifiers, next actions.
10. Screenshot scam scanner — prepared deterministic local demo with extracted phone/UPI/URL/phrases and risk score.
11. Cybercrime Copilot — natural-language incident classification on Home and Report.
12. Voice complaint — browser SpeechRecognition when supported; typed fallback otherwise.
13. Dynamic next-action recommendations by incident type.
14. Smart Evidence Assistant — extracted demo fields + evidence completeness score + missing evidence.
15. Automatic incident timeline generated from the structured complaint.
16. Bank Account Freeze / Lien Help — separate optional support flow inside Track.
17. Open-source call scanner — local Hindi/English/Hinglish transcription, timestamped suspicious phrases, bilingual scam-signal rules and explainable risk scoring.

## Existing UI retained

- Existing homepage hero imagery and response cards.
- Start Report, 1930 call action, anonymous women/child route.
- Existing Report autosave/validation/local-only privacy model.
- Existing Check demo identifiers and validation.
- Existing Track local-case history and downloadable status.
- Existing Learning Corner, safety checklist and playbooks.
- Existing Volunteers screen.
- Existing Contact screen.
- Existing accessibility menu, larger text and reduced motion.
- Existing mobile persistent 1930 action.

## Prototype boundary

All police/bank/1930 actions are explicitly simulated, with no external government or banking integrations. Report and screenshot evidence remains browser-local and deterministic. Call recordings are sent only to the separately started local FastAPI service, where faster-whisper transcribes them and the bilingual rule engine scores scam signals; no paid or cloud AI API is used.
