# Agent Handoff — Claude → Codex

## Branch

`claude/octolabs-brand-review`

## What I Changed

All changes are in `index.html`.

**Copy:**
- Hero tagline: passive → active ("apps that earn their keep, tools that respect your time, games worth actually playing")
- Hero stats: "Lab / Always tinkering" + "Calm / Built with care" → "Indie / No roadmap, no VC" + "Open / Free to explore" — these are honest and say something real
- Hero origin line: "Useful internet things" (repeated from title) → "An indie product studio"
- ArtisanMU desc: removed "Mauritians" (location messaging) and "invoiced on WhatsApp" (mercantile/too specific)
- AniCal desc: feature list → invitation framing ("Stay close to the shows you love…")
- OctoQuiz desc: mode names ("Brain Blitz, Flags, Imposter mode") that mean nothing to new visitors → experience framing ("fast rounds, loud rooms, no app to install")
- Studio h2: "A small lab for useful internet things" (repeated the main tagline concept) → "Small ideas, made with care"
- Studio copy: "side quests / tiny experiments / little products" → curiosity/craft language
- Sticker: "Ship fast" → "Ship with care" (brief explicitly says avoid hustle/founder-mode tone)
- OctoQuiz signal card: removed "surface" (jargon for a party game)
- About attribution: "Online-first" (meaningless) → "Est. 2026"

**Mascot SVG:**
- Hat brim stroke: `#0B1120` dark → `#C6A87C` gold, opacity 0.8. The favicon-embedded SVG already uses gold for this element — the big interactive mascot should match.

## Why

- The brief says: curiosity, craft, play. Avoid money language, avoid repeated location, avoid hustle.
- "Nice to spend time with", "invoiced on WhatsApp", "Ship fast", "Online-first" all cut against that tone.
- The hat brim inconsistency between favicon and mascot made the mascot feel less polished than it should.

## Verification

- Opened the preview. All text reads correctly in context.
- Interactive mascot still swims, eyes track, hat bobs — physics untouched.
- `git diff --stat` confirms 14 lines changed, 1 file.

## Open Questions

- **Hero stats strip:** "Indie / No roadmap, no VC" reads strong but might be too arch for some audiences. Alternative: "Indie / Built without investors". Up to Codex to judge tone.
- **ArtisanMU focus pills** still say "Local services" — this is fine (implies geography without naming it), but worth a second look.
- **OctoQuiz aria-label** on the card still says "Multiplayer party trivia" — could update to match new desc if accessibility pass happens.

## Mascot — replaced (follow-up commit)

The original interactive full-page **swimming octopus** was scrapped per
feedback (felt off / over-engineered). It's been replaced with a **simple,
flat cartoon octopus-with-hat** living statically in the hero, closer to the
clean reference style (kawaii / Vecteezy top-hat octopus).

- Removed `#octo-world` SVG, the ~230-line physics/animation JS IIFE, and all
  related CSS (`#octo-svg`, `.octo-tentacle-path`, `.ink-dot`, `inkFade`,
  mobile + reduced-motion octopus rules). Net −327 / +54 lines.
- New mascot: round gold body (`#D9BC8C`→`#B6915E`), 5 tentacles, two friendly
  white eyes, smile, coral cheeks, navy top hat with a gold band + coral
  button. Lives in `.hero-mascot` with a gentle 6s float (respects
  reduced-motion via the global media query).
- This is a **starting point** — deliberately simple, easy to iterate on.

### Open mascot questions for Codex
- **Hat colour:** I went navy top hat + gold band (reads like the classic
  black-top-hat references while staying on the dark/gold palette). The brief
  originally said *mint* hat. Pick one and make it consistent.
- **Nav-bar logo mark** (`.nav-logo-mark`, still in `<nav>`) is the *old* tiny
  gold octopus with a flat mint cap. It no longer matches the new hero mascot's
  top hat. Should be redrawn to match once the hat direction is locked.
- **Favicon** (inline SVG in `<head>`) is also the old octopus mark — same
  consistency note.

## Suggested Next Step

- **Lock the mascot direction** (hat colour + style), then propagate it to the
  nav logo mark and favicon so all three octopus marks agree.
- **Product card hover colour:** Currently all three cards share the same mint
  hover radial glow. Could give each card its own accent colour (mint for
  AniCal, coral for OctoQuiz, gold/warm for ArtisanMU) to add personality
  without breaking the system.
