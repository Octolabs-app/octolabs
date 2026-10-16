# OctoHome

A little structure. A lot more living.

An Apple-inspired, responsive household organiser by Octolabs. Version 0.1.0 is a working, offline-first prototype. It has no paid services or external JavaScript dependencies.

## Working now
- Today dashboard and six household departments.
- Add chores; claim and release them through local member profiles; complete and undo.
- Daily and weekly recurrence creates a future occurrence on completion.
- Weekly dinner menu, editing and ingredient merging into groceries.
- Shopping list, quantities, estimated prices, bought state and budget.
- Nine currency denominations: MUR, EUR, USD, GBP, ZAR, INR, AUD, CAD, AED. Changing denomination does not exchange or convert prices.
- Member profiles, light/dark appearance and household settings.
- Recurring routine alerts while the app remains open.
- Browser JSON backup export/import; device-local persistence.
- Native Android WebView shell with packaged offline assets; Android 8+.

## Important boundaries
This is not yet a shared cloud database. Profiles and changes are stored on each device. Smart devices are not connected. Background push notifications, invitations, sleep tracking, and automatic lights/vacuum control are planned. Android file backup import/export is not implemented. Sample data is generic and editable.

## Try / develop
Serve this directory with any static HTTP server, e.g. `python -m http.server 8080`. Open http://localhost:8080. There is no dependency install or frontend compilation step. For cloud development use GitHub Codespaces with the repository and serve this folder; the laptop is not needed.

Run `node --test octohome/tests/model.test.cjs` from the repository root.

## Android compilation
Install Java 17+ and Android SDK platform 35/build-tools 35.0.0, set ANDROID_HOME, then run `python octohome/android/build.py` from repository root. The output is `octohome/android/build/octohome-0.1.0.apk`.

GitHub Actions workflow **OctoHome Android** builds and verifies the APK in the cloud on source pushes and manual dispatch, then uploads the APK as an artifact. The artifact is a development build, not a Google Play release. Its generated development signing key is ephemeral: a subsequent build may require uninstalling an earlier APK, which clears local data. Production release signing must use a durable protected key before real distribution.

See [PLAN.md](PLAN.md) for the full product roadmap, architecture, acceptance criteria and next steps.
