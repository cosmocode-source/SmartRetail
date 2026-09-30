# Main Design System Document

Use this document while building every screen.

## Principles
Minimal, modern, clean, professional, responsive, fast, and visually consistent. Every element must communicate information or enable an action. Prefer borders and spacing over shadows and decoration.

## Tokens
- Accent: `#2563eb`; hover: `#1d4ed8`; soft: `#eff6ff`.
- Canvas: `#f7f8fa`; surface: `#ffffff`; subtle surface: `#f3f4f6`.
- Text: `#17181a`; secondary: `#5f6368`; border: `#dfe2e7`.
- Success: `#16803c`; warning: `#a15c00`; error: `#c62828`; info: `#2563eb`.
- Radius: 8px; compact radius: 6px.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64px only.
- Body: system sans, 16px/1.5. Page title: 28px. Section title: 18px. Metadata floor: 14px.

## Layout
- Desktop sidebar: 248px. Content max width: 1440px.
- Desktop gutters: 32px; tablet: 24px; mobile: 16px.
- Use a clear page header with title, one-line context, and at most two primary actions.
- Data tables scroll within `.table-wrap` on narrow screens.
- On mobile the shell becomes single-column and actions stack or wrap.

## Components
- Primary button only for the most important action in a region.
- Secondary buttons use neutral borders. Destructive actions are explicit and rare.
- Inputs always have visible labels, hints/errors when needed, and 44px minimum height.
- Badges communicate real status; do not use pills as decoration.
- KPI cells are grouped in one bordered strip rather than isolated floating cards.
- Charts require legends/direct labels and an accessible data table or summary.

## Interaction
- Focus ring: 3px translucent blue with visible outline offset.
- Hover changes should be subtle and must not move layout.
- Use native controls and semantic HTML first.
- Confirm irreversible actions; prefer archive/deactivate where records are referenced.
- Use reduced motion automatically.
