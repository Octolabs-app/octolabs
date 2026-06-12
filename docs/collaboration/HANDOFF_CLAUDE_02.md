# Agent Handoff — Claude → Codex/Allan

## Branch

`claude/site-remake-rezavu`

## What I Changed

All changes in `index.html` (single-file site preserved).

**New product: Rezavu**
- Added a 4th product card — "Booking · Launching soon", lagoon-blue accent,
  deliberately NOT a link (no dead links before rezavu.octolabs.app is live).
  Swap the `<div class="product-card product-soon">` for an `<a href>` once
  the domain serves.
- Hero announcement chip ("New — Rezavu, WhatsApp-native booking") above the
  mascot, linking to #products. Subtle pulse dot, brand-blue.
- Hero stats: "3 Products live" → "4 Products · 3 live, 1 launching".
- Studio signal grid: "Next Drop" card replaced with Rezavu; ticker updated.

**Per-product accent system** (the open suggestion from HANDOFF_CLAUDE_01)
- Cards + signal cards now carry `data-accent`: ArtisanMU gold (default),
  AniCal mint, OctoQuiz coral, Rezavu blue. Accent drives the tag color,
  hover glow, hover border, focus pills, meta dots and arrow — one custom
  property (`--accent`), no per-card CSS duplication.

**Mascot consistency** (open question from HANDOFF_CLAUDE_01 — resolved)
- Favicon redrawn to match the current hero/nav mascot: gold body, navy top
  hat with gold band + coral button. All three octopus marks now agree.
  Direction locked: **navy top hat, gold band, coral button**.

**Mobile + a11y**
- Nav links no longer disappear below 640px — Products/Studio/About stay
  visible (only Contact is hidden); logo scales down.
- `:focus-visible` outline (gold) and `::selection` styling added.
- Launching-soon card has a proper aria-label; arrow hidden there.
- Footer now lists all live products (more paths into the portfolio).

## Why

- Rezavu is the studio's next launch and the page didn't mention it — the
  announcement chip + card give the homepage a "something is happening here"
  pulse, which is exactly the linger factor the brief asks for.
- Accent colors give each product its own mood without breaking the calm
  dark/gold system (brief: "small mint/coral accents only where they add
  personality").
- The favicon was the last old-mascot holdout; brand marks now consistent.

## Verification

- Served statically and browsed: hero chip, 4 cards (2×2 on desktop, stacked
  on mobile), per-accent hovers, signal grid, ticker, footer links.
- No console errors. Reduced-motion still disables all animation.
- `color-mix()` is used for accent borders/hovers — supported in all
  evergreen browsers since 2023; degrades to no-glow on ancient ones.

## Open Questions

- **Rezavu link**: flip the card to a real `<a>` once rezavu.octolabs.app is
  live (Cloudflare Pages deploy is on Allan's checklist in the Rezavu repo).
- **og.png** still doesn't exist (meta points at /og.png) — same status as
  before, waiting on final brand art. The favicon SVG could be the base.
- "Products · 3 live, 1 launching" stat copy is wordier than the old format —
  fine to trim to "Products" if it reads busy.

## Suggested Next Step

- Ship og.png (1200×630) using the locked mascot direction.
- When Rezavu goes live: link the card, change tag to "Booking · Live",
  move the announcement chip to whatever launches next.
