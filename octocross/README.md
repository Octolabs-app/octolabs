# OctoCross

Static English-language themed crosswords at `/octocross/`, integrated into the existing Octolabs Pages site. No accounts, runtime API, paid service, or scheduled server job.

## Content and honest counts

The v1 catalog contains **200,008 distinct generated grid variations**, 25,001 per theme. The original editorial bank has **256 answer/clue pairs** (32 per theme), so answers and clues recur. This is not 200,008 separately authored crosswords. Grids are connected free-form crosswords, not symmetrical American newspaper crosswords. Eight themes rotate; expanding editorial breadth requires adding reviewed clues and themes, not merely increasing seed count.

`catalog.json` stores only accepted deterministic seeds (~1.1 MB uncompressed). The browser regenerates one grid at a time. `validation.json` records the exhaustive build result. The build rejects grids with fewer than nine entries and deduplicates the actual filled grids using SHA-256 across all themes. All multi-letter runs have clues; every crossing agrees; all cells are connected. No database was scraped.

## Weekly schedule

The week starts Monday at 00:00 **Indian/Mauritius (UTC+4)**. Epoch: Monday 19 October 2026. All players see the same theme/puzzle within a week. Themes cycle every eight weeks, then select the next accepted seed. Dates come from the player's device; changing the device clock can change the weekly selection. There is no competitive leaderboard.

## Gameplay

Tap a clue or square, type on the physical/on-screen keyboard, or enter a complete answer. Tap a crossing twice or press Space to change direction. Arrow keys navigate adjacent words; Enter/Shift+Enter navigate clues; Tab exits the grid. Check word marks wrong letters; Reveal letter increments the hint count. Clear word also clears shared crossing cells. Larger squares enables a horizontally scrollable grid for touch accessibility. Completion checks every answer exactly. Finished puzzles remain viewable; Play another puzzle starts the next library entry.

Progress is saved per puzzle in browser localStorage. Storage errors produce a visible message. The timer pauses on hidden tabs or manual pause. Shared links include only theme and ordinal, never progress. English only in v1; existing bilingual games are unaffected.

## Development and verification

- `node scripts/build-crosswords.mjs`: rebuild and independently validate all 200,008 grids. `CROSSWORD_COUNT` optionally changes the per-theme count for local experiments; do not publish a partial catalog under the production count.
- `node --test tests/octocross.test.mjs`: catalog counts, deterministic regeneration, grid invariants, deliberate corruption, weekly timezone/year rollover.
- `node --check octocross/app.mjs`
- CI regenerates the full catalog and rejects unexpected checked-in differences.

Treat engine v1, original clue answers/order, and seed catalog as immutable for saved puzzle identity. If generation or answers change, increment VERSION and update storage keys/catalog together; preserve old versions for shared links before migration.

Release verification: all 200,008 grids passed exhaustive validation (335 rejected candidates, zero duplicate accepted grids). Existing game/model suites and new crossword tests passed. Desktop browser verified game filters, answer entry, persistence after reload, pause/resume, and full puzzle completion. Narrow-screen CSS and a larger-square option are provided; real-device touch testing remains useful.
