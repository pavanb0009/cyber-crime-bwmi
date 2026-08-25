# Rakshak visual system

## Design premise

The interface should feel like a calm public incident command centre: credible enough for a high-stakes service, distinctive enough for a hackathon review, and quiet enough that the content remains the hero.

## Colour roles

| Token | Value | Role |
|---|---:|---|
| Ink | `#07100f` | Primary background; calm, high-contrast field |
| Panel | `#0b1715` | Main cards and form surfaces |
| Paper | `#f2f4ec` | Primary text and high-confidence neutral action |
| Signal | `#c7ff67` | Primary action, active state and successful progress |
| Aqua | `#72e5df` | Information, navigation and verification |
| Coral | `#ff7569` | Urgent financial action and destructive warning |
| Saffron | `#ffb45f` | Active review status and caution |
| Muted | `#9bb0aa` | Secondary explanation text |

The lime accent is used sparingly. A screen should usually have one dominant signal action.

## Typography

- **Manrope Variable** for interface and editorial display text
- **JetBrains Mono Variable** for references, system labels, state indicators and small metadata
- Display headings use tight tracking and compact line-height to create a recognisable editorial voice.
- Body copy stays generous and readable; long public-service text never uses the display treatment.

## Shape and depth

- Small controls: 9–12 px radius
- Standard surfaces: 16–24 px radius
- Hero / major shells: 28–30 px radius
- Borders do most of the separation work; shadows are soft and reserved for focal layers.
- The signal border is a custom gradient edge, not a generic neon glow.

## Motion

- Entrance: 450–700 ms with small vertical movement
- State change: 180–250 ms
- The network scan is slow and atmospheric, not informational.
- All motion is removed by the built-in reduced-motion preference.

## Interaction principles

1. **Urgency first:** the 1930 action appears before form completion when money has moved.
2. **Progress is visible:** steps, completion percentage and status stage are explicit.
3. **Actions use verbs:** “Start a report,” “Check before you trust,” “Track this case.”
4. **Warnings explain why:** caution is paired with a reason and next action.
5. **Empty states demonstrate value:** every route includes a reviewer-ready example.
6. **Prototype honesty is persistent:** simulated data and missing integrations are never hidden.
