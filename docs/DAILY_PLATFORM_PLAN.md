# Daily platform: decision and acceptance plan

Scope: an accessible games hub, meaningful daily progress, and reliable local persistence. This is a product specification, not a claim that accounts, cloud sync, or platform-wide ranking exist. OctoPairs is removed from the active catalogue, navigation, promotional copy and install metadata. Existing deep links need a deliberate redirect or retirement page rather than a broken game link.

## Product model

The primary promise is a short, satisfying daily challenge to compare with friends. The hub should lead with available editions, clear Play / Continue / Completed states, and explicit Daily or Weekly badges. Keep practice and multiplayer discoverable as separate modes. A catalogue visit or card click is not a completed puzzle.

Do not claim that Letters & Numbers has a common daily edition unless a deterministic edition actually exists. Its existing solo or multiplayer match can remain a practice/party option and must not silently count toward a daily set. A weekly crossword must be labelled weekly; do not reset it or award another completion every day.

First release success means players understand what is available, finish a challenge, and return voluntarily. More games and a large generated library are secondary. Generated grid validation proves structural properties, not fresh clues, editorial accuracy or an enjoyable difficulty curve.

## Edition identity and reset policy

- Daily boundary: 00:00 UTC. Daily period ID is the UTC calendar date, e.g. `2026-10-26`. Display the reset convention near the daily set; Mauritius is UTC+4, so reset occurs at 04:00 there.
- Weekly boundary: Monday 00:00 Mauritius (Sunday 20:00 UTC). Preserve the existing integer weekIndex and content-based save keys; do not migrate the weekly schedule.
- Completion key: schema version + game + mode + period type + period ID + puzzle content version. Store content identity/seed separately so edition rotation does not overwrite saved crossword answers.
- Freeze edition identity when a game starts. Finishing after midnight belongs to the edition that was opened, not the finish date. The hub can offer the new edition without changing the board in progress.
- Shared date alone is insufficient: a daily manifest or deterministic generator/data version must produce the same board and rules for everyone in that edition. Translated labels should preserve puzzle identity; genuinely different language puzzles require separate variants.
- Refresh hub availability on visibility/focus and after a boundary. Do not abruptly reload an active puzzle. Use UTC functions, not browser locale date strings.

Source review: OctoFlag `dailySeed()` already uses UTC dates. OctoCross `weekIndex()` currently offsets +14,400,000 milliseconds for Monday midnight Mauritius. This release retains that weekly schedule. Its answer storage key is content-based (`octocross-v1-{theme}-{seed}`); retain that compatibility and do not delete prior progress during the transition.

## Completion and progress rules

Record completion only after the game reaches its real terminal success condition: final submitted answer for a quiz, or all crossword letters verified. A quiz can be completed with wrong answers; completion and perfect score are separate. Record hints/assistance separately. A revealed crossword can count as assisted completion without implying an unaided solve.

Completion is idempotent per edition. Double-clicking, rendering the results twice, reopening a solved crossword, refreshing, going back, or replaying must not increase the count. Keep first completion time; a later best score may improve an explicitly separate personal best. Do not infer current completion from elapsed time, a URL parameter, a practice high score, or cumulative correct answers.

OctoFlag's existing `run.progressSaved` protects only one run from repeatedly adding its correct-answer total. Replaying can add practice correct answers again. That lifetime practice metric is valid, but cannot serve as unique daily completion history.

Recommended hub summary: completed current daily editions / currently available daily editions, plus an independent weekly state. Do not mix a weekly crossword into a daily denominator without explaining it. Track active days from qualifying daily completions. Weekly completion should not automatically fill seven activity days. Preserve historical results when a game leaves the catalogue; calculate today's denominator from the current manifest.

Local streak: consecutive UTC completion dates, deduplicated across games. Completing two games today yields one active day. Before today's first completion, yesterday's ongoing streak is still shown as eligible; after a full missed day it expires. Prefer “3 active days this week” over punitive streak language until the policy is tested.

## Local persistence and clock limits

Wrap reads, parsing and writes independently. Validate schema, allowed games/modes, date format, finite nonnegative values and bounded collection size. Ignore invalid records safely without crashing the game or pretending it is completed. A write may fail despite a successful read. Continue play with in-memory state and show “Progress is available in this tab only” when durable saving fails.

Use accurate copy: “Saved in this browser on this device.” Do not claim account backup, cross-device sync, verified rankings or a permanent history. Private browsing, clearing site data, a different browser and subdomains can have different storage. Same-origin paths can share a ledger; the separate OctoQuiz subdomain cannot access the parent origin's localStorage directly. Do not use an unrestricted postMessage bridge to trust completion from another origin.

Device clocks can be wrong or changed. Client-only daily availability and local streaks are personal convenience, not anti-cheat. Avoid awarding future completion dates or migrating a prior completion to a new date when the clock changes. Use a monotonic clock for in-session elapsed time where possible; background suspension and wall-clock jumps need explicit handling. A trusted server edition/time and authenticated idempotent writes are prerequisites for authoritative cross-device history and competitive rewards.

For multiple tabs, re-read before writing, deduplicate keys, and refresh on `storage` events. Single localStorage blobs are not transactional; simultaneous unrelated completions can still race. Do not promise strong concurrent consistency. IndexedDB transactions or a server ledger are the later reliable options.

## Acceptance scenarios

These test outcomes are behavioral requirements, not tests that merely reproduce the implementation.

| Scenario | Required outcome |
|---|---|
| 2026-10-26 23:59:59.999 UTC versus next millisecond | Daily ID changes once; weekly ID stays Monday 2026-10-26 |
| Sunday 2026-11-01 19:59:59.999 UTC versus 20:00 | Weekly index advances once at Monday midnight Mauritius |
| Year boundary, leap day, UTC+4 and UTC-8 browser timezone | Same instant yields same UTC edition; no locale drift |
| Start before midnight, finish after midnight | Old edition completes once; current new edition remains playable |
| Double submit, repeated results render, refresh after completion | One completion; first timestamp stable; score policy explicit |
| Replay daily or solve matching practice puzzle | No extra daily count; practice cannot impersonate an edition |
| Crossword reload while incomplete / already solved | Answers restore; real solved state verified; no duplicate award |
| Hints and reveal used | Assisted completion truthfully represented; no unaided badge |
| Empty storage / corrupt JSON / unsupported schema / malformed values | Hub works; safe empty state; no fabricated progress |
| Storage getter throws / write throws / quota exceeded | Game remains usable; saving limitation visible; no “saved” claim |
| Two tabs complete same edition | One edition in merged history; UI refreshes on storage event |
| Two different completions race | Document known localStorage limitation or use transactional persistence |
| Clock moves backward, forward, or invalid date supplied | No crash or duplicate; no authoritative competition claims |
| Visit hub after reset without reload | New daily appears after focus/visibility update; active game stays intact |
| Weekly puzzle solved on Tuesday then hub visited Wednesday | Weekly stays completed; Wednesday daily activity not fabricated |
| Remove OctoPairs | No active cards, search results or promotional counts refer to it; history not destroyed |
| Keyboard/mobile/screen reader | Play/Continue/Completed announced in text; status not color-only; comfortable targets |

Use injected fixed dates and an injectable storage adapter for meaningful unit coverage. Add a browser integration check that completes a real small edition, returns to the hub and reloads. Test storage exceptions explicitly. Do not require an actual midnight wait.

## Measurement before expansion

North-star candidate: weekly returning solvers completing on at least three distinct days. Measure new-player first completion, daily edition start-to-completion, exact-date D1/D7 retention cohorts, weekly active days, and referred completions. Segment practice, daily and weekly modes; separate unique solvers from events and exclude internal testing. Cloudflare request counts and pageviews alone cannot answer whether players returned or solved anything. Local-only progress cannot provide reliable aggregate retention by itself.

For an early recruited cohort, inspect abandonment and collect short feedback before interpreting small percentage changes. Proposed internal gates, not industry benchmarks: verify completion reliability with 30–50 intended players over two weeks; fix frequent friction before acquisition spend; retain a new game only if its use or feedback justifies ongoing support. Record cohort definitions, sample size and uncertainty. Avoid importing LinkedIn's reported return rates as comparable targets.

The first growth experiment is a spoiler-free result plus a named “Challenge friends” action. Track share intent -> referred visit -> referred completed challenge; a clipboard click is not confirmed sharing. Private friend leagues can make comparisons meaningful without depending on a large empty global leaderboard. Accounts, moderation, fair scoring and abuse controls precede public competitive promises.

## Monetization sequence

1. Keep a worthwhile daily set free and playable without mandatory registration. Prove puzzle quality and voluntary return first.
2. Test explicit demand for paid archives, extra themed packs and personalization after users form a habit. Existing free archives should not be silently removed during this release.
3. Test private social league conveniences after evidence of repeat friend play. Do not sell ranking advantages, hints that affect competitive standings, or baseline accessibility.
4. Consider small, relevant sponsorships or supporter access before intrusive advertising. No billing changes or new paid infrastructure are authorized by this plan.

Price discovery is a later experiment with real purchase intent, not a forecast inferred from pageviews. Track support/content effort, payment fees, infrastructure cost per completed session and churn. Daily editorial quality and reliable operation remain recurring costs even if hosting is free.

Decision rule: fund expansion only when the current experience retains players and each addition has an owner, operating budget, quality checks and a measurable purpose. Branding should support recall and trust while preserving the existing Octolabs domain and game URLs until a migration has clear benefits.

## Updated release decision: daily platform plus streamer entry

The intended upcoming daily set is Daily Cross, Daily Flag and a new deterministic Daily Numbers edition. This is planned scope, not a statement that those modes have shipped. The earlier weekly-crossword guidance continues to apply to a separately offered weekly edition; it must not accidentally restrict a genuinely separate Daily Cross. Every daily mode needs its own stable edition identity and actual completion integration. Ranked Flag remains distinct from relaxed daily play, with explicit rules for whether either mode satisfies the hub's single Flag completion slot. A player must not need to complete both merely to finish today's set.

Daily Numbers must freeze the UTC edition and generator version, provide the same operands/target/rules for all players of that variant, and validate expressions using the real numbers game rules. A seed link must reproduce the board independently of the visitor's current date. Do not grant completion merely for opening a board or posting an arbitrary score. Separate first completion, best result, assistance and practice replay. If ranked competition is not implemented for this mode, show personal results rather than a purported verified world rank.

Keep the practice library as a useful way to continue after the dailies. Accurate current proposition: **200,008 generated crossword grid variations drawn from 256 original clue/answer pairs across eight themes**. Distinct grids are not 200,008 independently authored puzzles or distinct clue sets. Recurring words are expected. Do not claim inexhaustible freshness or use a large number as evidence of editorial depth. The library is good for testing combinations and difficulty, while the next content investment should expand reviewed clue breadth. Measure repeat-clue exposure and feedback rather than only total grid count.

### Streamer activation

Offer a large, legible board and an explicit Streamer mode with named controls. Present the puzzle, timer and actions clearly at typical video capture sizes without showing unnecessary personal details. Provide a seed/edition challenge link and a spoiler-free share result. A viewer opening that link plays an independent copy of the same versioned puzzle. This is **same-puzzle play**, not a synchronized live audience room: no promise of shared answers, real-time viewer state, crowd voting, score aggregation or automatic chat integration.

The first streamer journey should be: open an edition -> enable readable board -> copy its challenge link -> explain the rules briefly -> solve -> invite viewers to try the same board -> compare self-reported results. Test whether the board remains readable in an actual stream capture and on a viewer's phone. Do not require creators to install an app or register before their first trial. Creator outreach is a future human-directed action and is not authorized or performed by this document.

Acquisition attribution should use a bounded campaign label rather than expose private identity in links. Count linked arrivals and completed challenges separately. If analytics cannot join those events reliably, use an opt-in recruited cohort and report that limitation. Do not interpret the number of viewers watching a stream as site players. Clipboard events show copy intent, not that a link was distributed.

### Thirty-day experiment plan

The following is an experiment design, not a scheduled automation or guarantee of adoption. Targets are internal stop/go gates rather than industry benchmarks. Prefer observed task success and repeated qualitative issues over statistical claims from tiny samples.

| Days | Work and test | Evidence and decision |
|---|---|---|
| 1-7 | Verify the three daily modes, UTC resets, replay idempotence and practice separation. Recruit 10-15 intended mobile/desktop players for observed first sessions. Ask several to use the large-board view. | Record rule comprehension, time to first meaningful action, completion, blockers and persistence failures. Fix every repeat blocking issue before promotion. Confirm attribution is measurable or explicitly label it unavailable. |
| 8-14 | Run the daily ritual with an initial 30-50-player cohort. Observe three creator-style rehearsals with people willing to try presenting; no need to assume they have an audience. | Measure unique daily completers, days active, first-puzzle abandonment and actual same-seed reproduction. A reasonable rehearsal gate is that all three presenters can start, explain and share without operator intervention; revise on failures. |
| 15-21 | Test a small set of consenting creator/community trials after the flow works. Give each trial a distinct campaign label. Test spoiler-free results against a simple puzzle link, sequentially if traffic is too small for randomization. | Track attributed arrivals -> starts -> completions -> exact-date D1/D7 returns. Report cohort sizes and source mix. Ask creators whether they would run it again without incentives. Do not declare a winner from a few clicks. |
| 22-30 | Review retained cohorts and content repetition. Interview returning players, dropouts and presenters. Test explicit interest in supporter/archive/theme options with truthful research copy; no checkout or charges. | Continue the daily set if players return voluntarily and quality is maintainable. Invest in streamer tools only if creators repeat and referred players complete/return. Expand reviewed clues before seed counts when repetition is the dominant complaint. |

For day-30 reporting, a D7 cohort includes only entrants with a full seven-day observation window. Separate existing friends/testers from referred new players and paid/incentivized participation. Report raw counts beside percentages. Do not pool weekly visits with exact-date D7 retention, or call a return to any page a solved-puzzle retention event.

Suggested decision dashboard: (1) first-session completion per game and device; (2) exact-date D1 and D7 completion retention; (3) distinct completion days per week; (4) campaign-attributed completed referrals; (5) creators presenting twice voluntarily; (6) repeat-clue complaints; (7) operational failures and content/support effort. The key growth loop is a hypothesis: satisfying daily -> understandable result -> friend/creator link -> new solver -> voluntary return. Neither seed sharing nor a mascot guarantees Wordle-like virality.

### Revenue and principal failure risks

Keep free dailies, current practice access and baseline Streamer mode useful. Only after evidence, test willingness to pay for genuinely new reviewed theme packs, deeper archives, customization or private league conveniences. Do not sell access to an alleged live viewer system that does not exist. Creator sponsorship or branded editions are possible later hypotheses, requiring actual audience fit and operational capacity. No new payments, infrastructure, billing changes, account system or integrations are introduced by this plan.

The highest failure risks are:

1. **Unfair or inconsistent editions:** version/date/language mismatches destroy comparison and trust. Test shared seeds across devices and preserve content versions.
2. **False progress:** click-based awards, duplicate results or ranked/practice confusion make the daily goal meaningless. Award once from the real terminal condition.
3. **Apparent volume without freshness:** 256 clue pairs can become familiar quickly. Review breadth and difficulty before increasing seed counts.
4. **Streamer promise exceeds product:** same-seed links are not live multiplayer. State the independent-play limitation plainly and test capture readability.
5. **Acquisition without retention:** traffic spikes and share clicks can obscure weak return behavior. Judge completed referrals and mature returning cohorts.
6. **Premature monetization:** removing established free value or adding interruptions can damage the habit before willingness to pay exists. Research demand before changing access.
7. **Scope exceeds upkeep:** three daily modes, a library and creator features each create quality/support work. Retire or postpone weak additions instead of spreading effort across more games.
