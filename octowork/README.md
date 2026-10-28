# OctoWork

Personal remote-work search workspace, built within the existing Octolabs repository. No user CVs are embedded in source. Browser storage contains the two profiles, imported jobs, applications and editable cover letters; export/restore supports manual backups. Other scripts on the same origin can access that storage. This is not an authenticated, encrypted, shared or cross-device workspace.

Run `node octowork/preview.mjs` from the website directory and open http://127.0.0.1:8792/octowork/. Run `node --test tests/octowork.test.mjs` for matching and letter checks. Production uses the existing Cloudflare Pages deployment, with the Pages Function at `/api/octowork/jobs`. No secrets, paid API, database or AI provider are required. The preview server exposes only an explicit asset allowlist and public feed.

## Scope

- Remotive public API collector, attributed and linked to original listings. Bounded response, 18-second timeout, 12-hour edge caching; local preview also caches and deduplicates concurrent fetches. Cloudflare cache is per location, not a global rate limiter. API jobs are delayed 24 hours at source. No scheduled scans or notifications.
- Upwork, Freelancer, PeoplePerHour, LinkedIn, Indeed, MyJob.mu and Jobs.mu are browse/import links, not automated adapters. No account connections or access to private listings. These links do not guarantee available eligible jobs.
- Manual import deduplicates canonical source URLs. Cross-platform duplicates are not resolved. Feed refresh preserves saved observations; withdrawn/expired jobs are not automatically removed, so original availability must be checked.
- Type, country and hours filtering. Missing fields stay unknown. A contract alone never proves 1–4 daily hours. Candidate comparison is transparent keyword overlap, not semantic AI or a validated recruitment score. Location is Mauritius-focused; broad regions stay unconfirmed.
- CVs accept pasted text or .txt upload. PDF/DOCX extraction is not implemented. No CVs were available when this was built; both profiles start blank.
- Cover letters are editable, evidence-based templates. No generative AI or automatic application sending. Quotes from CV lines require user review for context, negation and proficiency.
- Application statuses, notes, draft download/copy, JSON backup/restore, local deletion.

## Deployment

Publish only this feature’s new files after reviewing the existing repository changes. `functions/api/octowork/jobs.js` must deploy with the static folder; a plain static host cannot serve the feed. Existing homepage/game changes were already present and are unrelated. Add a homepage link separately when the tool is ready for public discovery. Do not commit browser backups or CV text. A future account-backed version requires authentication and private storage before syncing CVs.

Source contract: https://github.com/remotive-com/remote-jobs-api (reviewed 2026-10-28). No signup gate for feed results. Remotive attribution and original URLs retained. Do not syndicate these listings onward to third-party job boards.
