# Octolabs

Octolabs makes browser games for friends and family. The homepage features OctoQuiz, Letters & Numbers and OctoFlag.

The studio homepage uses a shared paper/forest palette with distinct purple quiz
and blue/coral letters-and-numbers marks. Product cards, studio principles and
Android installation details replace the previous simple product listing.

## Android download

`downloads/letters-and-numbers-1.1.0.apk` is the signed online Android client
built from `Octolabs-app/octobrain/android`. Its SHA-256 file sits alongside it.
Android 8.0+, internet required. The signing key stays outside both repositories.
For updates, use the same key, increment versionCode, publish a versioned file,
regenerate the checksum, and update the download link and version text together.

## Local preview

Run `python -m http.server 8080` from the repository root and open http://localhost:8080.

## Architecture and deployment

Dependency-free static HTML, CSS, and SVG. No build step, secrets, environment variables, database, or authentication are required for this homepage.

Cloudflare Pages project `octolabs` connects to `Octolabs-app/octolabs`. Production branch: `main`. Root and output directory: repository root. Branch pushes produce previews; merging to main publishes to octolabs.app and www.octolabs.app.

Before publishing, check desktop/mobile layout, keyboard focus, local asset responses, and the OctoQuiz links. After publishing, verify the homepage and assets on the public domain. Roll back by reverting the release commit on main.

OctoQuiz is maintained separately in `Octolabs-app/octoquiz`. Its live domain is https://octoquiz.octolabs.app and is routed to the `octoquiz` Cloudflare Worker. The older Pages project exists too; it is not the current room runtime.

## Brand

The mark is a geometric number 8, replacing the octopus. Forest green #254f38, lime #d9ee88, warm paper #f5f1e8, lilac and peach accents. Use bold, clear typography and game-piece shapes. Keep the site lightweight, readable, and welcoming.

Other products are no longer promoted on this homepage. Their infrastructure and repositories have not been deleted. There were no separate public subpages in this repository to remove.

## Letters & Numbers

Letters & Numbers is maintained in the private Octolabs-app/octobrain repository. Play at https://octolabs.app/letters-and-numbers/. The Cloudflare Worker route `octolabs.app/letters-and-numbers*` (with the legacy `/octobrain*` alias retained) serves the game, its prefixed assets and APIs directly; the root homepage remains on Pages. Its SQLite Durable Objects use the free tier, one room per object, native WebSocket hibernation and timed cleanup. The static octobrain.html is a fallback product page if that route is removed; it is not the live game.

## OctoFlag

`octoflag/` is the bilingual geography game at https://octolabs.app/octoflag/. It shares the framed game structure, responsive spacing and persistent light/dark preference with Letters & Numbers. The game pages and flag assets are static on Pages. Casual scores, passport progress and preferences stay in browser local storage; two-player mode alternates turns on one device. Challenge URLs reproduce a seeded quiz, and Daily Passport uses the UTC date.

Five modes: mixed world tour, name the flag, find the flag, capital questions and world regions. Relaxed or 15-second sprint, regional filters, two difficulty pools, missed-country practice and a no-score flag explorer. Casual trips include a once-per-trip 50/50 lifeline. Streaks, passport medals and local progression reward discoveries; sound is optional. Flags are local SVGs with their original proportions. Geography sources and ODbL license are documented in `octoflag/DATA_SOURCES.md` and `octoflag/DATA_LICENSE.txt`.

Daily Sprint adds a server-scored leaderboard through `cloudflare/octoflag/`: a Cloudflare Worker routed only to `/octoflag/api/*`, with D1 storage and no account system. The server locks answers, enforces 15-second questions and computes scores. Players can optionally publish a nickname and score. Today shows each browser identity's best daily score; the weekly board sums those daily bests over the last seven UTC days. There is no live multiplayer. Browser identity tokens are private, stored locally and hashed in D1; clearing browser storage creates a new identity. Run tokens expire after 30 minutes. A daily cleanup removes expired runs and scores older than 90 days.

This is casual competition: public geography assets, repeatable quizzes and anonymous identities allow lookup or automated play. The server rejects arbitrary score injection, but the board is not cheat-proof. The API needs the D1 and rate-limit bindings in its Wrangler config, not an application secret key. Cloudflare authentication is needed to deploy. See [the backend runbook](cloudflare/octoflag/README.md) for migration, local preview, deployment and verification steps.

Run `node --test tests/octoflag*.test.mjs`, `npm ci --prefix cloudflare/octoflag`, then `npm test --prefix cloudflare/octoflag` before publishing. Checks cover quiz generation, gameplay helpers and real workerd/D1 API behavior. Casual play works with the normal static server; use the backend runbook's proxy for ranked play. After deploying the Worker and Pages, verify a full round, daily/challenge links, a ranked submission and both leaderboard periods, touch targets and light/dark screens on mobile/tablet, and confirm the country pack and flag responses. Roll back code by reverting the release commit; preserve D1 score data.
