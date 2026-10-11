# OctoFlag ranked API

The static OctoFlag game is served by Cloudflare Pages. This Worker handles only
`octolabs.app/octoflag/api/*` and `www.octolabs.app/octoflag/api/*`. Its D1 binding
`DB` stores private ranked runs and opt-in public daily scores. The standalone
game needs no database for casual play.

## Ranked play

Daily Sprint uses the same 12 mixed questions for everyone on a UTC date, in
English or French. The server starts and checks each 15-second deadline, locks
each answer once, and calculates points and streaks. Answer retries are
idempotent. A request for the current question cannot restart its clock.
Question responses omit the answer key and unneeded country metadata; the
answer response reveals the result only after that answer is locked.

Submitting a score is optional and requires the run's private token and its
owner's browser identity token. Client-supplied score, timing or correctness
fields are ignored. Nicknames are normalized and restricted to 2–20 characters.
Only the best score for a browser identity on each date is retained, with lower
elapsed time breaking score ties. Today lists daily bests; Week totals each
identity's daily bests over the last seven UTC dates, including today. A weekly
display name comes from that identity's latest submitted day.

There are no accounts, passwords or cross-device recovery. The game stores a
random private player token in browser local storage. D1 stores its SHA-256
hash, not the raw token. Clearing storage or using another browser creates a
new identity. Public board responses contain nickname, rank, score, correct
count, elapsed time and days played; they omit private tokens and hashes.

This is casual competition, not a cheat-proof tournament. Geography assets are
public, the daily quiz is repeatable, and anonymous players can create new
browser identities. Server scoring prevents clients from posting arbitrary
score values; it does not prevent lookup or automated play.

## Storage and request limits

`migrations/0001_rankings.sql` creates `ranked_runs` and `daily_scores` with
indexes. Runs expire after 30 minutes and expired tokens stop working
immediately. The scheduled cleanup at 03:17 UTC deletes expired runs and score
rows older than 90 days. Expired run rows can remain until that cleanup.

`START_LIMIT` allows 10 starts per minute per IP; `API_LIMIT` allows 120 API
mutations per minute per IP. Mutation requests require an allowed Origin and a
JSON body of at most 4 KiB. Leaderboard reads are public and responses disable
caching. No IP address is written to these D1 tables.

`wrangler.jsonc` contains the D1 database ID, routes, rate-limit namespace IDs,
cron and observability settings. These binding identifiers are not secrets.
The application needs no secret API key. Deployments require authenticated
Cloudflare access; keep any deployment credentials outside the repository.

## Install and test

Use Node.js 22 or later. From this directory:

```sh
npm ci
npm test
npm run build
```

The tests bundle the actual Worker with esbuild and run it in Miniflare/workerd
with isolated D1 storage and the real migration. They check question
sanitization, concurrency, deadlines, retries, full quiz scoring, ownership,
nickname validation, daily bests, weekly aggregation, privacy and invalid
requests. Test fixtures and direct SQL writes affect only this local database.
The repository CI also runs `tests/octoflag*.test.mjs` for the static game.

## Local ranked preview

Apply the migration to Wrangler's local D1 database:

```sh
npx wrangler d1 migrations apply octoflag-leaderboard --local
```

Create an untracked `.dev.vars` in this directory with:

```dotenv
LOCAL_ORIGIN="http://127.0.0.1:5180"
```

Start the Worker in one terminal and the static/API proxy in another, both from
this directory:

```sh
npm run dev
```

```sh
node preview.mjs
```

Open http://127.0.0.1:5180/octoflag/. The proxy serves the repository's static
pages and forwards `/octoflag/api/*` to Wrangler on port 5181 while preserving
the Origin header. Use that exact browser origin, as `localhost` is different.
The server binds only to `127.0.0.1` and does not list directories or serve files
outside the resolved repository root. A plain static server remains sufficient
for casual quizzes.

## Deploy and verify

Run the static and API tests first. Inspect the selected Cloudflare account and
the binding IDs in `wrangler.jsonc`. Apply the checked-in migration before
deploying code that depends on it:

```sh
npx wrangler d1 migrations apply octoflag-leaderboard --remote
npm run deploy
```

The `DB` database must already exist in the selected account. A new account
needs its own D1 database and updated binding ID. This migration creates tables
and indexes; it does not replace existing score data. The routes must use the
same account's `octolabs.app` zone. Push the static game changes to the existing
Pages repository separately. Do not route the entire `/octoflag/*` prefix to
this API Worker.

After deployment, check `/octoflag/api/health`, then open the public game in a
browser and complete a ranked sprint. Confirm an optional nickname submission,
its Today entry and Week total. Also check a retry, a timed-out answer, mobile
and tablet layout, theme/sound controls, and normal casual play. Confirm the
scheduled trigger is configured and inspect logs for request or leaderboard
errors. These are release checks to perform, not claims that deployment has
already happened.

Rollback the Worker and static release if verification fails. Preserve D1
rows; a code rollback should not delete the leaderboard database.
