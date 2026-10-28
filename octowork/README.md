# OctoWork

Personal remote-work search workspace, built within the existing Octolabs repository. No user CVs are embedded in source. Browser storage contains the two profiles, imported jobs, applications and editable cover letters; export/restore supports manual backups. Other scripts on the same origin can access that storage. This is not an authenticated, encrypted, shared or cross-device workspace.

Run `node octowork/preview.mjs` from the website directory and open http://127.0.0.1:8792/octowork/. Run `node --test tests/octowork.test.mjs` for matching and letter checks. Production uses the existing Cloudflare Pages deployment, with the Pages Function at `/api/octowork/jobs`. No secrets, paid API, database or AI provider are required. The preview server exposes only an explicit asset allowlist and public feed.

## Scope

- Remotive and Jobicy public-feed adapters, attributed and linked to original listings. Each fetch includes at most the latest 200 records (partial coverage). Bounded response, 18-second timeout, 12-hour edge caching; failed combined fetches cache for 10 minutes. One failed provider does not discard the other provider's results. Remotive records have a 24-hour source delay. Jobicy's public feed covers its recent publication window. Cloudflare cache is per location, not a global rate limiter. No scheduled scans or notifications.
- Upwork, Freelancer, PeoplePerHour, LinkedIn, Indeed, MyJob.mu and Jobs.mu are browse/import links, not automated adapters. No account connections or access to private listings. These links do not guarantee available eligible jobs.
- Manual import deduplicates canonical source URLs. Cross-platform duplicates are not resolved. Feed refresh preserves saved observations; withdrawn/expired jobs are not automatically removed, so original availability must be checked.
- Type, country and hours filtering. Missing fields stay unknown. A contract alone never proves 1–4 daily hours. Candidate comparison is transparent keyword overlap, not semantic AI or a validated recruitment score. Location is Mauritius-focused; broad regions stay unconfirmed.
- CVs accept pasted text or .txt upload. PDF/DOCX extraction is not implemented. No CVs were available when this was built; both profiles start blank.
- Cover letters are editable, evidence-based templates. No generative AI or automatic application sending. Quotes from CV lines require user review for context, negation and proficiency.
- Application statuses, notes, draft download/copy, JSON backup/restore, local deletion.

## Deployment

Publish only this feature’s new files after reviewing the existing repository changes. `functions/api/octowork/jobs.js` must deploy with the static folder; a plain static host cannot serve the feed. Existing homepage/game changes were already present and are unrelated. Add a homepage link separately when the tool is ready for public discovery. Do not commit browser backups or CV text. A future account-backed version requires authentication and private storage before syncing CVs.

## Private access and design

Cloudflare Access application `4bbea9a2-28df-4ada-81b1-14629ab3bd5e` protects `/octowork` and `/api/octowork` on octolabs.app, www, the project pages.dev domain and all preview subdomains. The only Allow rule contains the two owners' emails, maintained outside source. Email PIN is the only configured identity provider. Signed-out production and preview requests were verified to reach the Access login screen. There are no bypass policies. Do not remove this protection when deploying the feature. Browser storage remains local to each device; login does not synchronize CVs.

Figma desktop/mobile/review layout: https://www.figma.com/design/xFUfQsUvs80UhnRqPlLbWz . Editable text, component instances and color variables; example listings are labelled illustrative. Uses Inter with an Arial fallback.

Source contracts: https://github.com/remotive-com/remote-jobs-api and https://github.com/Jobicy/remote-jobs-api (reviewed 2026-10-28). Original attribution and URLs retained. Do not syndicate these listings onward to third-party job boards.
