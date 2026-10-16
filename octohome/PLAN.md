# OctoHome — product and delivery plan

## 1. Product promise
Run a home with the clarity of a small business and the warmth of a family. Reduce remembering, duplicate effort and unnecessary notifications. Organise by departments without turning relationships into employee management.

Initial audience: couples, then families and shared homes. Primary devices: Android phones, tablets on a kitchen counter, and desktop browsers. English first; French and Mauritian Creole localisation follow. Mauritius is the initial context, with MUR as the default currency and household timezone explicitly configurable in the cloud version.

## 2. Experience and design
Apple-inspired restraint: generous whitespace, rounded cards, system typography, quiet sage accents, subtle depth, large touch controls, accessible labels, light/dark appearance and a compact mobile bottom bar. Original Octolabs identity; no Apple branding or implied affiliation. Overview is the daily landing screen. Chores, Meals, Groceries and Routines are one tap away. Departments and household settings remain accessible from the overview and settings.

Guiding rules: no guilt, no compulsory scoring, no public comparison of household members. Every automation has a visible state and a manual override. Use calm copy and useful empty states. Aim for touch targets of at least 44 CSS pixels in the next accessibility pass, AA contrast and reduced-motion support.

## 3. Departments
| Department | Scope | Later connections |
| --- | --- | --- |
| Cleaning | Rooms, laundry, bins, supplies | Robot vacuum, washer status, bin sensor |
| Kitchen | Weekly meals, shopping, pantry, leftovers | Fridge inventory where available, recipe import |
| Wellbeing | Backyard exercise, bedtime, quiet time | Optional wearables, smart lights |
| Maintenance | Repairs, filters, service records | Leak sensors, appliance diagnostics |
| Finances | Grocery budget, bills, shared expenses | Manual import first; bank connections only if explicitly requested |
| Outdoors | Plants, backyard, watering | Compatible irrigation and weather inputs |

## 4. Functional requirements
### Household and people
One user may belong to multiple households. Roles: owner, adult member and optional restricted member. Invite via expiring single-use link; revoke access and remove devices. Profiles have name, avatar, notification preferences, timezone and quiet hours. Any person can claim an open task. Atomic claim prevents two devices taking the same task. Assigned tasks can be offered for swap. Personal sleep and health data remain private by default.

### Chores
Fields: household, department, title, optional instructions, priority, due date/time, timezone, recurrence, assignee or open pool, status, completion audit and optional device action. Statuses: open, claimed, in progress, blocked, completed, skipped. Support one-off, daily, weekly, selected weekdays and monthly patterns. Handle travel and daylight-saving changes using named timezones. Occurrences have a unique series/date key. Schedule from the series rather than repeatedly copying historical tasks in the production implementation. Snooze and reschedule without losing history. Allow undo, edit, archive and deletion with clear recovery.

### Meals and shopping
Seven-day menu, meals with servings and ingredients, editable recipes, dietary preferences and leftover plans. Ingredient merging should eventually normalise units and quantities, not just names. Shopping has shared checkboxes, categories, quantity, unit, estimated/actual prices and purchaser. Pantry items can be excluded before adding ingredients. No expiry date is inferred without evidence. Budget follows the household currency. Monetary values in cloud storage use integer minor units and an ISO currency code. Currency changes must never silently reinterpret a financial ledger. Initial prototype offers denomination only; future exchange display requires a dated rate and explicit conversion.

### Routines and notifications
Quiet daily digest plus selected time-sensitive events. Let members choose reminder channels. Example Sunday laundry creates an occurrence and notifies the relevant members. Example full bin is manually flagged initially; a sensor can later create the event. Notify everyone once, then stop once claimed. Device completion or failure updates the job. Add delivery receipts, deduplication keys and retry limits. Android native scheduling is required for reliable device reminders while closed; server push supports other members and cross-device updates. Respect denied permissions. Browser timers are not a background scheduler.

### Devices
Start with a Home Assistant bridge for compatible robot vacuums and lights, subject to actual device support. Do not promise universal compatibility. Household admin connects devices with scoped credentials, stored server-side and encrypted. Never embed vendor keys in APK or web bundles. Device registry contains capability, location, online status and last confirmation. Execution states: requested, accepted, running, succeeded, failed, unknown. Timeouts never become false success. Use idempotency, room occupancy checks and pause controls. Start with low-impact lights/vacuum actions; locks, heaters and cooking appliances require separate design and explicit user control.

### Sleep and exercise
Bedtime routine first: reminder, optional lights, quiet hours. Wearable sleep import is optional and separated from shared household data, with consent, deletion and retention controls. Exercise supports shared backyard sessions with adjustable difficulty and no required health tracking.

## 5. Architecture
### Phase-one implementation (present)
Dependency-free HTML/CSS/JavaScript frontend; browser localStorage. Same assets bundled in a native Android WebView. Android serves only allowlisted assets on an internal HTTPS origin, blocks other navigation and requests, disables local file access and has no JavaScript-to-native bridge. APK requires no Google services and no internet permission in this offline version. Android backup file handling remains pending.

### Target cloud architecture (planned, not provisioned)
Static frontend and small authenticated API; relational household database; background scheduler; Web Push/native notification registrations; integration adapter service. Prefer existing Octolabs free-tier infrastructure. Evaluate Cloudflare Workers/D1 with an established identity provider versus Supabase Auth/Postgres before implementation. Confirm current limits and actual account access, and do not enable paid plans. No anonymous endpoint may read or mutate a household. Do not use a shared household password as the final identity design.

All reads and writes must enforce household membership server-side. Test tenant isolation independently. Offline clients keep an outbox with operation IDs and reconcile server versions. Task claim uses compare-and-set. Shopping merges per item; destructive changes require server versions. Sensitive state is not stored in the public source repository. Production Android should move sensitive persisted data out of plain WebView storage when accounts are introduced.

### Entities
Household, User, Membership, Department, TaskSeries, TaskOccurrence, TaskClaim, MealPlan, Recipe, Ingredient, GroceryItem, PantryItem, Budget, Expense, Routine, Device, IntegrationCredential, AutomationRule, AutomationRun, NotificationPreference, NotificationDelivery and AuditEvent. Every household-owned entity carries household_id. Keep private wellbeing records separately permissioned.

## 6. Delivery milestones and acceptance
### Milestone 0 — working concept (this delivery)
Deliver responsive overview, department views, local profiles, chore creation/completion/claim, recurrence, seven meals, grocery merging, budget/currency settings, routine toggles, explicit integration placeholders, product plan, automated model tests, Android build script and cloud build workflow. Done when tests pass and APK compilation/signature verification succeeds. Physical-device smoke testing remains separate.

### Milestone 1 — useful to the couple
Add authentication and invite flow; real shared cloud persistence; atomic claims; secure account recovery; timezone; chore editing/archiving; Android file backup; stable release signing. Acceptance: two independent devices see updates, double-claim races resolve correctly, invalid invites fail and one household cannot access another.

### Milestone 2 — dependable reminders
Native notification permission flow, recurring background schedules, quiet hours, digest, snooze, deep links and delivery deduplication. Acceptance: Sunday reminder fires with the app closed, denied permission has a clear fallback, one claimed bin task stops reminders to others, timezone changes do not duplicate occurrences.

### Milestone 3 — a connected home
One real vacuum and one real light integration via a supported bridge. Acceptance: confirm actual running and completion state, handle offline device, expired credentials and retries, cancel safely, and make the job visible to household members. No device success without confirmation.

### Milestone 4 — richer home management
Pantry/expiry tracking, servings and unit normalisation, rotating responsibilities, recurring bills, maintenance records, optional wearable import, multilingual UI, tablet dashboard and accessibility improvements. Acceptance uses household feedback rather than engagement or notification volume.

## 7. Cloud development and Android delivery
Source and plan live inside `Octolabs-app/octolabs/octohome`. GitHub is the source of truth. GitHub Actions compiles APKs on a cloud Linux runner on relevant main-branch pushes or manual dispatch, executes model tests, verifies APK signature and retains an artifact for 30 days. No local laptop must remain on. GitHub Codespaces can be used for remote editing; respect the account's included quota and never upgrade billing automatically.

Development APK is signed using a generated development key. It is suitable for testing only, and subsequent fresh cloud builds can have a different signing identity. Establish a stable protected release keystore and backup procedure before rollout. Never commit signing keys, household backups, notification tokens or integration credentials. Play Store publication, production signing and an AAB are separate from delivering an installable testing APK.

Web delivery target: `/octohome/` on the existing Octolabs static host, after verifying its deployment mechanism and output. Do not report a working URL based solely on a Git commit. If the existing host does not auto-deploy this folder, use the supported hosting route and verify the returned deployment.

## 8. Validation
Automated domain checks cover recurrence, duplicate prevention, ingredient deduplication, repurchase of bought ingredients, currency formatting and one-off completion. UI smoke test: create chore, claim as one profile, switch member, complete, refresh, edit meal, add ingredients twice, buy/edit groceries, select currency, toggle routine, change appearance, backup/restore on web. Verify 360px, 768px and desktop layouts. APK build checks Java compilation, DEX generation, packaging, zip alignment and signature. Test APK launch/navigation/storage/keyboard on a physical Android device or emulator before declaring device validation complete.

## 9. Current limitations and next work
Version 0.1.0 is a functional local prototype, not the complete connected-home product. Current reminders require an open app. Device cards are honest placeholders. Shared profiles are not secure logins. Currency display is not FX conversion. There is no cloud household database yet. Next highest priority: secure cross-device sharing, then reliable reminders, then one real device integration. No paid services have been enabled.
