# Hackathon submission notes

## Product name

**CyberDesk — Citizen cybercrime helpdesk**

## Submission summary

Cybercrime victims rarely arrive at a public portal thinking in legal categories. They arrive thinking, “Money left my account,” “Someone took my account,” or “I am being threatened.” CyberDesk redesigns the citizen journey around that moment of panic.

The homepage works as a response navigator: it asks what happened, immediately surfaces time-critical guidance such as calling 1930 for financial fraud, and then moves the citizen into a focused journey. The prototype includes a four-step complaint flow with local autosave, evidence guidance, anonymous reporting for sensitive women/child incidents, a synthetic acknowledgement and a trackable case timeline. It also includes a suspect checker for phone numbers, UPI IDs, emails and websites, plus short situation-based safety playbooks.

The design language is intentionally distinct from a conventional government dashboard: an editorial “incident command centre” with restrained motion, a custom signal network, strong typography and one clear action at each stage. The interface is responsive, keyboard-friendly and includes larger-text and reduced-motion settings.

This is an independent prototype. It uses fictional data, makes no live government API calls, copies no official logo and clearly labels every simulated outcome.

## Problem

Citizens experiencing cybercrime face three simultaneous problems:

- They do not know which complaint category or department applies.
- They may lose critical time before taking the urgent first action.
- Existing status language often does not explain what is happening or what comes next.

## Core idea

**Convert a portal menu into a decision system.**

The product asks a plain-language question, identifies urgency, explains what evidence matters and keeps the next action visible.

## 90-second demo script

**0–15 seconds — Home**  
“This is CyberDesk. Instead of asking citizens to understand the portal, it starts with what happened. I’ll choose ‘Money left my account.’ Notice that calling 1930 appears before the online form.”

**15–50 seconds — Report**  
“The report is four short steps. Categories are plain-language. I’ll use demo details, add synthetic evidence, review exactly what will be submitted and acknowledge the prototype boundary. The draft is saved locally throughout.”

**50–65 seconds — Acknowledgement and tracking**  
“Submission creates a fictional acknowledgement, not a fake success message. Opening Track shows a human-readable timeline, assigned unit, current stage and next expected action.”

**65–80 seconds — Suspect checker**  
“I can check a phone number, UPI ID, email or URL. The result explains why it was flagged, what the repository cannot guarantee and what to do next.”

**80–90 seconds — Close**  
“The differentiator is not visual decoration or a chatbot. It is a calmer decision architecture for a high-stress public service.”

## Demo data

- Track: `RK-DEMO-26-84019`
- Phone: `9876543210`
- UPI: `refunddesk@upi`
- Email: `support-kys@example.com`
- URL: `https://secure-update.example`

## What is real in the prototype

- All navigation and routes
- Form validation and step progression
- Local draft autosave
- Evidence selection/name handling
- Synthetic case creation
- Local case tracking
- Suspect-result logic
- Search, filters, accordions and checklist
- Responsive layout and accessibility preferences

## What is simulated

- Government authentication
- Complaint registration in NCRP/police systems
- Evidence upload
- Jurisdiction assignment
- Officer actions and status events
- Repository data and complaint counts
- Notifications

## Judging alignment

| Criterion | Evidence in the build |
|---|---|
| Real public problem | Reduces category confusion and time lost during urgent cyber incidents |
| Working build | Complete report → acknowledgement → track path plus suspect and learning journeys |
| Usability | Plain language, one-action hierarchy, responsive controls and visible next steps |
| Product thinking | Urgency-aware triage, contextual evidence prompts and honest integration boundaries |
| End-to-end completeness | A citizen can finish every demonstrated journey with synthetic data |
| Honesty | Persistent independent-prototype disclosure and no official branding or live data |
