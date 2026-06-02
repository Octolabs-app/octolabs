# Octolabs — Master Implementation Brief

You are the lead developer for **Octolabs** (octolabs.app), a product studio from
Mauritius. Work through every task below in order. Commit after each major task.
Do not skip steps. If you hit a blocker, document it and move to the next task.

---

## Context

| Key | Value |
|---|---|
| GitHub user | A1l4n |
| GitHub org | octolabs-app |
| Domain | octolabs.app (Cloudflare — Pages + DNS) |
| Landing page repo | A1l4n/octolabs → deployed on Cloudflare Pages |
| Brand bg | #0B1120 |
| Brand gold | #C6A87C |
| Brand text | #E8E6E1 |
| Fonts | Jura (headings), Crimson Pro (body italic), system-ui (body) |
| Contact | hello@octolabs.app |

**Supabase projects (already live):**

| App | Project ID | Region | Status |
|---|---|---|---|
| ArtisanMU | tlvgcxshiapqswcyyvyq | ap-southeast-1 | ACTIVE |
| AniCal | seopeujrimwxnuvcbfxx | eu-west-1 | ACTIVE |

---

## Task 1 — ArtisanMU: fix Supabase sync + admin login

**Repo:** `A1l4n/ArtsianMU`

The ArtisanMU Supabase project was recreated from scratch on 2026-06-02.
The frontend almost certainly still points to stale credentials from a previous
project. Fix it completely.

### Steps

1. Find every `.env` / `.env.local` / `.env.production` file and every
   `createClient(...)` call. Update all Supabase credentials to:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tlvgcxshiapqswcyyvyq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsdmdjeHNoaWFwcXN3Y3l5dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjk4MDYsImV4cCI6MjA5NTk0NTgwNn0.MVJN-4wU7_cnPPPlX8IVcxDVG3CoPqPHmTebHGbMCVM
   ```

2. Find the admin panel / admin login flow. If it uses a hardcoded password
   string (e.g. `if (password === "admin123")`), replace it with proper Supabase
   Auth using `supabase.auth.signInWithPassword({ email, password })`.
   The admin user must be created manually via:
   Supabase Dashboard → Authentication → Users → Add user.
   Add a comment near the auth call stating: `// Admin user created in Supabase
   Dashboard. Email: admin@artisanmu.octolabs.app`

3. Run `npm run dev`, open the app in the browser, and verify:
   - Artisan listing loads without console errors
   - Admin login page renders and accepts credentials
   - Supabase network requests go to `tlvgcxshiapqswcyyvyq.supabase.co`

4. Commit: `fix: point to new ArtisanMU Supabase project, fix admin auth`

---

## Task 2 — OctoQuiz: refactor yomu-game-night into a full rebrand

**Repo:** `A1l4n/yomu-game-night`
(Next.js + Socket.IO — Trivia, Imposter, Truth or Dare, After Dark couples mode)

**Target:** Deploy as `octoquiz.octolabs.app` on Cloudflare Pages

### Step A — Rename and rebrand

1. Rename the repo from `yomu-game-night` to `octoquiz` via GitHub Settings →
   Repository name. Then reclone or update your remote:
   ```
   git remote set-url origin https://github.com/A1l4n/octoquiz
   ```

2. Do a project-wide find-and-replace for all casing variants:
   - `Yomu Game Night` → `OctoQuiz`
   - `yomu-game-night` → `octoquiz`
   - `Yomu` → `OctoQuiz`
   - `yomu` → `octoquiz`

3. Update `package.json`: name, description, homepage.

4. Apply the Octolabs design system to every page and component:
   - Background: `#0B1120`
   - Primary accent: `#C6A87C`
   - Text: `#E8E6E1`
   - Muted text: `rgba(232,230,225,0.45)`
   - Cards/surfaces: `rgba(255,255,255,0.03)` with `1px solid rgba(198,168,124,0.12)`
   - Font: import Jura from Google Fonts, apply to headings and UI labels

5. Replace any existing logo/icon with the Octolabs octopus SVG mark. Use this
   exact inline SVG (it is the animated logo from the landing page):
   ```html
   <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="32" cy="26" r="12" fill="#C6A87C"/>
     <circle cx="28" cy="24" r="1.6" fill="#0B1120"/>
     <circle cx="36" cy="24" r="1.6" fill="#0B1120"/>
     <path d="M22,36 Q18,46 20,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
     <path d="M27,37 Q24,47 28,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
     <path d="M32,38 Q32,48 32,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
     <path d="M37,37 Q40,47 36,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
     <path d="M42,36 Q46,46 44,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
   </svg>
   ```

6. Update `<title>`, `og:title`, `og:description`, and favicon to OctoQuiz branding.

### Step B — Make it more fun

Do not remove any existing game modes. Improve and extend them.

1. **Countdown timer** — Replace any plain timer with an animated SVG progress
   ring. Under 5 seconds: ring pulses, color shifts to red (`#EF5350`), plays a
   tick sound every second.

2. **Sound effects** — Use the Web Audio API (no external audio files needed).
   Create a `sounds.ts` utility that generates:
   - Tick: short 880 Hz beep (50ms)
   - Correct answer: ascending chime (C5 → E5 → G5)
   - Wrong answer: descending buzz (200 Hz → 100 Hz)
   - Round winner fanfare: short melody
   - Game over: full fanfare

3. **Confetti** — Install `canvas-confetti` and trigger:
   - Small burst on correct answer
   - Full screen explosion on game-over winner reveal

4. **TV / Big Screen mode** — Add a toggle button (icon: TV or monitor).
   When active: increase all font sizes by 40%, hide non-essential UI chrome,
   show the room code in the top corner in large text. Designed for a laptop
   plugged into a TV as the host screen.

5. **Player screens (phones)** — Answer buttons must be minimum 72px tall.
   Call `navigator.vibrate(100)` on answer tap if supported.

6. **Lobby improvements**:
   - Emoji avatar picker: 8 options (🦑 🐙 🦈 🦊 🐺 🐸 🦁 🐯)
   - Each player shows their emoji + name as a card
   - Entrance animation as players join (slide in from bottom)
   - Animated waiting pulse on "Waiting for host..."

7. **Score animations** — After each round, float a `+NNN pts` delta up from
   each player's name card, then animate the score counter incrementing.

8. **Game over screen** — Full-screen winner celebration: player name in large
   gold text, their emoji avatar, confetti, 👑 crown, and a "Play Again" button.

9. **New trivia category: Mauritius** — Add at least 10 questions about
   Mauritius (history, culture, geography, food) to the trivia question bank.

### Step C — Deployment readiness

1. **Assess Socket.IO compatibility** with Cloudflare Pages (serverless).
   - If there is already a separate Socket.IO server (e.g. on Railway/Render),
     keep it. Document the server deploy URL in `.env.example` as
     `NEXT_PUBLIC_SOCKET_URL=`.
   - If there is no dedicated server, or if you want full serverless deployment,
     migrate real-time state to **Supabase Realtime Broadcast**. Use ephemeral
     channels only — no database tables needed. The channel name is the room
     code: `supabase.channel('octoquiz:ROOMCODE')`. Use Presence for the player
     list and Broadcast for game events. Use this project:
     ```
     URL : https://seopeujrimwxnuvcbfxx.supabase.co
     ANON: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlb3BldWpyaW13eG51dmNiZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjUzNjEsImV4cCI6MjA5NDM0MTM2MX0.XT8abPOuAygiZEP7HOwbF7Mk8Z7wqC_6cw-0lZK_ClI
     ```

2. Run `npm run build` — it must succeed with zero errors before committing.

3. Add a `wrangler.toml` at the root for Cloudflare Pages:
   ```toml
   name = "octoquiz"
   compatibility_date = "2026-01-01"
   pages_build_output_dir = ".vercel/output/static"
   ```

### Step D — Commit and push
```
git add -A
git commit -m "feat: rebrand to OctoQuiz, Octolabs design system, game-night improvements"
git push origin main
```

---

## Task 3 — AniCal: document the Huawei App Gallery issue

**Repo:** `A1l4n/anical`

Do NOT modify AniCal's UI or code. The app has been removed from the landing page
temporarily while a Huawei App Gallery review issue is resolved.

1. Log in to the Huawei AppGallery Connect developer console.
2. Find the rejection or required-modification notice for the AniCal submission.
3. Create a file `HUAWEI_REVIEW.md` at the root of `A1l4n/anical` documenting:
   - The exact issue Huawei flagged
   - Which files or features need to change
   - Any deadline given
4. Commit: `docs: document Huawei App Gallery review requirements`

Once Huawei approves the app, re-add the AniCal card to the landing page
(`A1l4n/octolabs` → `index.html`) between ArtisanMU and OctoQuiz:

```html
<a class="product-card" href="https://anical.octolabs.app"
   target="_blank" rel="noopener noreferrer" aria-label="AniCal - Anime tracker">
  <div class="product-tag">App &middot; Live</div>
  <div class="product-name">AniCal</div>
  <p class="product-desc">Clean, ad-free anime tracker. Weekly schedule,
  episode tracker, streaming links &mdash; no account needed.</p>
  <div class="product-meta">
    <span>Global</span><span class="product-meta-dot"></span>
    <span>Entertainment</span><span class="product-meta-dot"></span>
    <span>2026</span>
  </div>
  <span class="product-arrow" aria-hidden="true">&rarr;</span>
</a>
```

---

## Task 4 — GitHub org: transfer all repos into octolabs-app

After Tasks 1–3 are committed and pushed, migrate every app repo into the
`octolabs-app` GitHub organization.

### Transfer commands (gh CLI)

```bash
# ArtisanMU — also fix the typo in the name (ArtsianMU → artisanmu)
gh api repos/A1l4n/ArtsianMU/transfer \
  -f new_owner=octolabs-app -f new_name=artisanmu

# AniCal
gh api repos/A1l4n/anical/transfer \
  -f new_owner=octolabs-app

# OctoQuiz (after rename from yomu-game-night is done)
gh api repos/A1l4n/octoquiz/transfer \
  -f new_owner=octolabs-app

# Landing page
gh api repos/A1l4n/octolabs/transfer \
  -f new_owner=octolabs-app
```

### After each transfer

Update every Cloudflare Pages project that references `A1l4n/*`:
- Cloudflare Dashboard → Pages project → Settings → Build & Deploy →
  Git repository → reconnect to `octolabs-app/*`
- Custom domains (artisanmu.octolabs.app, octoquiz.octolabs.app, octolabs.app)
  do not need to change.

Update any GitHub Actions workflow files that hardcode `A1l4n/` to use
`octolabs-app/` instead.

---

## Task 5 — GitHub org: profile and settings

### Org README

Create the org profile repo and README so the org page looks polished.

```bash
gh repo create octolabs-app/.github --public
```

Create `profile/README.md` inside it:

```markdown
<p align="center">
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#0B1120"/>
    <circle cx="32" cy="26" r="12" fill="#C6A87C"/>
    <circle cx="28" cy="24" r="1.6" fill="#0B1120"/>
    <circle cx="36" cy="24" r="1.6" fill="#0B1120"/>
    <path d="M22,36 Q18,46 20,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M27,37 Q24,47 28,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M32,38 Q32,48 32,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M37,37 Q40,47 36,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M42,36 Q46,46 44,54" stroke="#C6A87C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  </svg>
</p>

<h3 align="center">Octolabs</h3>
<p align="center"><em>Build what matters. Made in Mauritius.</em></p>

<p align="center">
  <a href="https://artisanmu.octolabs.app">ArtisanMU</a> &nbsp;·&nbsp;
  <a href="https://anical.octolabs.app">AniCal</a> &nbsp;·&nbsp;
  <a href="https://octoquiz.octolabs.app">OctoQuiz</a>
</p>

<p align="center">
  <a href="mailto:hello@octolabs.app">hello@octolabs.app</a>
</p>
```

### Branch protection (run for each repo in the org)

```bash
for REPO in artisanmu anical octoquiz octolabs; do
  gh api repos/octolabs-app/$REPO/branches/main/protection \
    --method PUT \
    --input - <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": [] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
done
```

---

## Execution order

1. Task 1 — ArtisanMU Supabase + admin fix (users are live, highest priority)
2. Task 2 — OctoQuiz rebuild and deploy
3. Task 3 — AniCal Huawei documentation
4. Task 4 — Transfer repos to octolabs-app org
5. Task 5 — Org profile + branch protection

---

*Brief prepared by Claude Code — Octolabs session 2026-06-02*
