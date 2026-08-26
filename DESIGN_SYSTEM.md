# Visual system

## Design premise

The interface should read like a credible public service: a government masthead people
recognise, a neutral page canvas, and colour used only where it carries meaning.

## Colour roles

| Token | Value | Role |
|---|---:|---|
| Paper | `#101012` | Primary text, high-contrast surfaces |
| Ink | `#ffffff` | Text on dark or accent surfaces |
| Muted | `#6c6c76` | Secondary explanation text |
| Mist | `#f7f7f8` | Section and card fills |
| Line | `#e6e6e9` | Hairline separation |
| Brand | `#1668cf` | Anything interactive: links, active nav, primary actions, focus |
| Alert | `#c8102e` | Reserved for 1930, danger results and destructive states |

Only two chromatic tokens exist. If something is neither interactive nor urgent, it stays
neutral.

## Layout

- Everything sits inside `.page-shell` (max width 1120 px) so the masthead, content and
  footer share one measure.
- `.card` (white, hairline border, soft shadow) is the standard container; `.surface-soft`
  is the quieter mist variant.
- Vertical rhythm comes from `.page-section` rather than ad-hoc padding.

## Typography

- **Manrope Variable** for interface and display text
- **JetBrains Mono Variable** for references, case numbers and small metadata
- One heading scale: `.section-title` for sections, a slightly larger clamp for page titles.
- Weight and size carry hierarchy; `.eyebrow` handles small uppercase labels.

## Shape and depth

- Controls: 8–12 px radius
- Cards and surfaces: 16 px radius
- Borders do the separating; shadows stay soft and are reserved for the masthead and cards.

## Motion

- Entrance: 300–450 ms with small vertical movement
- State change: 150–250 ms
- All motion is removed by the built-in reduced-motion preference.

## Interaction principles

1. **Urgency first:** the 1930 action appears before form completion when money has moved.
2. **Progress is visible:** steps, completion percentage and status stage are explicit.
3. **Actions use verbs:** “Start a report,” “Check before you trust,” “Track this case.”
4. **Warnings explain why:** caution is paired with a reason and next action.
5. **Empty states demonstrate value:** every route includes a reviewer-ready example.
6. **Prototype honesty is persistent:** simulated data and missing integrations are never hidden.
