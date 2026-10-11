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

`octoflag/` is the static bilingual geography game at https://octolabs.app/octoflag/. It shares the framed game structure, responsive spacing and persistent light/dark preference with Letters & Numbers. No build step, environment variables, database or sign-in. Scores and preferences stay in browser local storage; there is no online leaderboard or live multiplayer. Two-player mode alternates turns on one device. Challenge URLs reproduce a seeded quiz; Daily Passport uses the UTC date.

Five modes: mixed world tour, name the flag, find the flag, capital questions and world regions. Relaxed or 15-second sprint, regional filters, two difficulty pools, missed-country practice and a no-score flag explorer. Flags are local SVGs with their original proportions. Geography sources and ODbL license are documented in `octoflag/DATA_SOURCES.md` and `octoflag/DATA_LICENSE.txt`.

Run `node --test tests/octoflag.test.mjs` before publishing. Checks cover all modes, regions, levels and languages, seeded reproducibility, scoring locks, unique answers and flag availability. Preview with the normal static server. After the Pages deployment, verify a full round, daily/challenge links, touch targets and light/dark screens on mobile/tablet, and confirm the country pack and flag responses. Roll back by reverting the release commit.
